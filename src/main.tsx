import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import RecipeBook from './RecipeBook.tsx'
import RecipePage from './RecipePage.tsx'

const path = window.location.pathname;

let Page: React.ComponentType<any> = RecipeBook;
let pageProps: Record<string, string> = {};

const recipeMatch = path.match(/^\/recipes\/(.+)$/);
if (recipeMatch) {
  Page = RecipePage;
  pageProps = { code: recipeMatch[1] };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Page {...pageProps} />
  </StrictMode>,
)
