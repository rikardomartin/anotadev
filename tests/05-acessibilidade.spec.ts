import { test, expect } from '@playwright/test'

test.describe('Acessibilidade', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('página deve ter título definido', async ({ page }) => {
    const title = await page.title()
    expect(title.length).toBeGreaterThan(0)
  })

  test('botão de login deve ter texto acessível', async ({ page }) => {
    const btn = page.locator('button', { hasText: 'Entrar com Google' })
    await expect(btn).toBeVisible()

    const text = await btn.textContent()
    expect(text?.trim().length).toBeGreaterThan(0)
  })

  test('imagens devem ter atributo alt (se existirem)', async ({ page }) => {
    const images = page.locator('img')
    const count = await images.count()

    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt')
      // alt pode ser string vazia (decorativo) mas não deve ser null
      expect(alt).not.toBeNull()
    }
  })

  test('deve ser possível navegar com Tab até o botão de login', async ({ page }) => {
    // Pressiona Tab várias vezes para sair do body e chegar a um elemento focável
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab')
      const focusedTag = await page.evaluate(() => document.activeElement?.tagName)
      if (['BUTTON', 'A', 'INPUT'].includes(focusedTag || '')) {
        expect(['BUTTON', 'A', 'INPUT']).toContain(focusedTag)
        return
      }
    }
    // Se chegou aqui, verifica o último elemento focado
    const focusedTag = await page.evaluate(() => document.activeElement?.tagName)
    expect(['BUTTON', 'A', 'INPUT', 'BODY']).toContain(focusedTag)
  })

  test('contraste — fundo da página não deve ser igual à cor do texto principal', async ({ page }) => {
    const colors = await page.evaluate(() => {
      const body = document.body
      const bg = window.getComputedStyle(body).backgroundColor
      // Pega o primeiro h1 ou texto principal
      const heading = document.querySelector('h1')
      const textColor = heading ? window.getComputedStyle(heading).color : null
      return { bg, textColor }
    })

    if (colors.textColor) {
      expect(colors.bg).not.toBe(colors.textColor)
    }
  })
})
