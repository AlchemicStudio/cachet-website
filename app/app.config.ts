export default defineAppConfig({
  ui: {
    // Mapped to the tonal ramps transcribed from the charte graphique.
    // `secondary` is the guide's accent magenta, reserved for CTAs and
    // active states; `info` is aqua, which only ever appears on dark
    // grounds or as a focus ring (aqua on white fails contrast).
    colors: {
      primary: 'indigo',
      secondary: 'magenta',
      info: 'aqua',
      neutral: 'neutral'
    },
    button: {
      defaultVariants: { size: 'md' }
    },
    card: {
      slots: {
        root: 'rounded-[var(--ui-radius)]'
      }
    }
  }
})
