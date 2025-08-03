export const useBreakpoints = () => {
  const { width } = useWindowSize()
  
  const breakpoints = {
    xs: 600,
    sm: 960,
    md: 1264,
    lg: 1904
  }
  
  const isXs = computed(() => width.value < breakpoints.xs)
  const isSm = computed(() => width.value >= breakpoints.xs && width.value < breakpoints.sm)
  const isMd = computed(() => width.value >= breakpoints.sm && width.value < breakpoints.md)
  const isLg = computed(() => width.value >= breakpoints.md && width.value < breakpoints.lg)
  const isXl = computed(() => width.value >= breakpoints.lg)
  
  const isMobile = computed(() => width.value < breakpoints.sm)
  const isTablet = computed(() => width.value >= breakpoints.sm && width.value < breakpoints.md)
  const isDesktop = computed(() => width.value >= breakpoints.md)
  
  const currentBreakpoint = computed(() => {
    if (isXs.value) return 'xs'
    if (isSm.value) return 'sm'
    if (isMd.value) return 'md'
    if (isLg.value) return 'lg'
    return 'xl'
  })
  
  return {
    // Individual breakpoints
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    
    // Device categories
    isMobile,
    isTablet,
    isDesktop,
    
    // Current breakpoint
    currentBreakpoint,
    
    // Breakpoint values
    breakpoints
  }
} 