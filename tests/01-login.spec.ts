import { test, expect } from '@playwright/test'

test.describe('Página de Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('deve exibir o logo e nome AnotaDev', async ({ page }) => {
    await expect(page.locator('text=AnotaDev').first()).toBeVisible()
  })

  test('deve exibir o botão de login com Google', async ({ page }) => {
    await expect(page.locator('text=Entrar com Google')).toBeVisible()
  })

  test('deve exibir as features da aplicação', async ({ page }) => {
    await expect(page.locator('text=Organize projetos com checklists')).toBeVisible()
    await expect(page.locator('text=Integração com GitHub API')).toBeVisible()
    await expect(page.locator('text=4 temas exclusivos')).toBeVisible()
  })

  test('deve exibir Firebase Auth e GitHub API no rodapé', async ({ page }) => {
    await expect(page.locator('text=Firebase Auth')).toBeVisible()
    // Usa seletor exato para o rodapé (evita conflito com "Integração com GitHub API")
    await expect(page.locator('span.text-xs', { hasText: 'GitHub API' })).toBeVisible()
  })

  test('botão de login deve mostrar estado de carregamento ao clicar', async ({ page }) => {
    // Intercepta o popup do Google para não abrir de verdade
    page.on('popup', popup => popup.close())

    const loginBtn = page.locator('button', { hasText: 'Entrar com Google' })
    await loginBtn.click()

    // Deve mostrar "Entrando..." brevemente
    await expect(page.locator('text=Entrando...')).toBeVisible({ timeout: 3000 })
  })

  test('deve ter fundo escuro por padrão (tema dark)', async ({ page }) => {
    const body = page.locator('body')
    const bg = await body.evaluate(el => window.getComputedStyle(el).backgroundColor)
    // Fundo escuro — não deve ser branco
    expect(bg).not.toBe('rgb(255, 255, 255)')
  })
})
