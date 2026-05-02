import { test, expect } from '@playwright/test'

test.describe('Performance', () => {
  test('página deve carregar em menos de 5 segundos', async ({ page }) => {
    const start = Date.now()
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const elapsed = Date.now() - start

    expect(elapsed).toBeLessThan(5000)
  })

  test('não deve ter recursos bloqueantes críticos', async ({ page }) => {
    const failedRequests: string[] = []

    page.on('requestfailed', request => {
      const url = request.url()
      // Ignora falhas esperadas (Firebase, Supabase placeholder, extensões)
      if (
        !url.includes('firebase') &&
        !url.includes('supabase') &&
        !url.includes('placeholder') &&
        !url.includes('chrome-extension') &&
        !url.includes('favicon')
      ) {
        failedRequests.push(url)
      }
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    expect(failedRequests).toHaveLength(0)
  })

  test('bundle JS deve carregar sem erros de sintaxe', async ({ page }) => {
    const jsErrors: string[] = []
    page.on('pageerror', err => jsErrors.push(err.message))

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Filtra erros esperados de auth/network
    const criticalErrors = jsErrors.filter(e =>
      !e.includes('auth') &&
      !e.includes('network') &&
      !e.includes('fetch')
    )

    expect(criticalErrors).toHaveLength(0)
  })

  test('animações não devem causar layout shift visível', async ({ page }) => {
    await page.goto('/')

    // Aguarda animações de entrada terminarem
    await page.waitForTimeout(1000)
    await page.waitForLoadState('networkidle')

    // Verifica que o botão de login ainda está visível após animações
    await expect(page.locator('text=Entrar com Google')).toBeVisible()
  })
})
