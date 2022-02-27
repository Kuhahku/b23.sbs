import { getAssetFromKV } from '@cloudflare/kv-asset-handler'

addEventListener('fetch', event => {
  event.respondWith(handleEvent(event))
})

async function handleEvent (event) {
  const requestURL = new URL(event.request.url)
  const path = requestURL.pathname
  const path_list = path.split('/')
  const local_file_list = ['', 'favicon.ico', 'stylesheets', 'images']
  if (local_file_list.includes(path_list[1])) {
    const page = await getAssetFromKV(event)
    return new Response(page.body, page)
  }
  const bURL = 'https://b23.tv' + path
  const url = await fetchUrl(bURL)
  return Response.redirect(url, 308)
}

async function fetchUrl (bURL) {
  const response = await fetch(bURL)
  let { host, pathname, searchParams } = new URL(response.url)
  if (searchParams.get('preUrl')) {
    const {
      host: realHost,
      pathname: realPathname,
      searchParams: realSearchParams,
    } = new URL(decodeURIComponent(searchParams.get('preUrl')))
    return await formatUrl(realHost, realPathname, realSearchParams)
  } else {
    return await formatUrl(host, pathname, searchParams)
  }
}

async function formatUrl (host, pathname, searchParams) {
  let params = []
  if (searchParams.get('p')) {
    params.push(`p=${searchParams.get('p')}`)
  }
  if (searchParams.get('page')) {
    params.push(`page=${searchParams.get('page')}`)
  }
  params = params.join('&')
  return `https://${host}${pathname}${params ? '?' + params : ''}`
}