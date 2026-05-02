import { test, expect } from '@playwright/test'

test.describe('Responsividade', () => {
  test('deve renderizar corretamente em desktop (1280x720)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('text=AnotaDev').first()).toBeVisible()
    await expect(page.locator('text=Entrar com Google')).toBeVisible()
  })

  test('deve renderizar corretamente em tablet (768x1024)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('text=AnotaDev').first()).toBeVisible()
    await expect(page.locator('text=Entrar com Google')).toBeVisible()
  })

  test('deve renderizar corretamente em mobile (375x812)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('text=AnotaDev').first()).toBeVisible()
    await expect(page.locator('text=Entrar com Google')).toBeVisible()
  })

  test('botão de login deve ser clicável em mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const btn = page.locator('button', { hasText: 'Entrar com Google' })
    await expect(btn).toBeVisible()
    await expect(btn).toBeEnabled()
  })

  test('card de login não deve transbordar em telas pequenas', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Verifica que não há scroll horizontal
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth
    })
    expect(hasHorizontalScroll).toBe(false)
  })
})
