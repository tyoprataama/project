// Filter SVG untuk efek "liquid glass" pada navbar (dipakai lewat CSS
// backdrop-filter: url(#glassDistortion)). Dirender sekali di root aplikasi.
// feTurbulence menghasilkan noise, feDisplacementMap membelokkan piksel latar
// di belakang panel sehingga terasa seperti kaca yang membiaskan cahaya.
export function GlassFilter() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className="pointer-events-none absolute h-0 w-0"
    >
      <defs>
        <filter
          id="glassDistortion"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.008 0.014"
            numOctaves={2}
            seed={17}
            result="noise"
          />
          <feGaussianBlur in="noise" stdDeviation={1.1} result="softNoise" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="softNoise"
            scale={26}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}
