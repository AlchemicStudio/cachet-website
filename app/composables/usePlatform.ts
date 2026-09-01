import type { Platform } from '#shared/types'

/**
 * Best-effort guess at the visitor's OS, used only to promote the matching
 * download. It resolves after mount so the prerendered HTML stays identical for
 * everyone, and every platform's asset remains one click away regardless.
 */
export function usePlatform() {
  const platform = useState<Platform | null>('platform', () => null)

  onMounted(() => {
    if (platform.value) return
    platform.value = detectPlatform()
  })

  return platform
}

function detectPlatform(): Platform | null {
  if (typeof navigator === 'undefined') return null

  // userAgentData is the non-deprecated path, available in Chromium browsers.
  const hinted = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform
  const source = `${hinted || ''} ${navigator.userAgent || ''}`.toLowerCase()

  if (source.includes('win')) return 'windows'
  // Order matters: an Android UA also contains "linux".
  if (source.includes('android')) return null
  if (source.includes('mac') || source.includes('iphone') || source.includes('ipad')) return 'macos'
  if (source.includes('linux') || source.includes('x11')) return 'linux'
  return null
}
