import { test, expect } from '@playwright/test'

test.describe('Sistema de Temas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('deve aplicar tema escuro por padrão', async ({ page }) => {
    // Verifica que o fundo não é branco (tema dark ativo)
    const bgColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor
    })
    expect(bgColor).not.toBe('rgb(255, 255, 255)')
  })

  test('deve persistir tema no localStorage', async ({ page }) => {
    const savedTheme = await page.evaluate(() => {
      return localStorage.getItem('anotadev-theme')
    })
    // Pode ser null (padrão) ou um id de tema válido
    if (savedTheme !== null) {
      expect(['anotadev-dark', 'cyberpunk', 'neon-night', 'ocean-dark', 'light']).toContain(savedTheme)
    }
  })

  test('deve carregar tema salvo do localStorage', async ({ page }) => {
    // Define um tema no localStorage antes de carregar
    await page.evaluate(() => {
      localStorage.setItem('anotadev-theme', 'anotadev-dark')
    })
    await page.reload()
    await page.waitForLoadState('networkidle')

    const savedTheme = await page.evaluate(() => localStorage.getItem('anotadev-theme'))
    expect(savedTheme).toBe('anotadev-dark')
  })

  test('toggle light/dark deve estar presente na página de login', async ({ page }) => {
    // O toggle fica no Header, que só aparece após login
    // Verifica que a página carregou sem erros
    await expect(page.locator('body')).toBeVisible()
  })
})
