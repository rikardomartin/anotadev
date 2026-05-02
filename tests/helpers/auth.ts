import { Page } from '@playwright/test'

/**
 * Injeta um usuário fake no Firebase Auth via localStorage/sessionStorage
 * para simular login sem passar pelo popup do Google.
 */
export async function mockLogin(page: Page) {
  await page.addInitScript(() => {
    // Mock do usuário autenticado no Firebase
    const fakeUser = {
      uid: 'test-user-123',
      email: 'teste@anotadev.com',
      displayName: 'Usuário Teste',
      photoURL: null,
    }

    // Sobrescreve o onAuthStateChanged para retornar o usuário fake
    ;(window as any).__PLAYWRIGHT_MOCK_USER__ = fakeUser
  })

  // Intercepta as chamadas do Firebase Auth
  await page.route('**/identitytoolkit.googleapis.com/**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ idToken: 'fake-token', localId: 'test-user-123' }),
    })
  })
}

/**
 * Aguarda a página de login carregar completamente
 */
export async function waitForLoginPage(page: Page) {
  await page.waitForSelector('text=AnotaDev', { timeout: 10000 })
  await page.waitForSelector('text=Entrar com Google', { timeout: 10000 })
}
