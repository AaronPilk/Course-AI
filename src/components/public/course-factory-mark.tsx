/**
 * Course Factory chevron-cluster mark, rendered inline so `currentColor`
 * inherits from the parent's CSS `color` — making the mark theme-aware
 * (purple on light, white on dark) without swapping image files.
 */
export function CourseFactoryMark({
  className,
  ariaLabel = "Course Factory",
}: {
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="220 600 290 260"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={ariaLabel}
      className={className}
    >
      <defs>
        <clipPath id="cfm-1">
          <path d="M363.363281 783.480469 L443.773438 783.480469 L443.773438 847.609375 L363.363281 847.609375 Z" />
        </clipPath>
        <clipPath id="cfm-1c">
          <path d="M407.316406 783.480469 L363.363281 783.480469 L399.6875 847.609375 L443.644531 847.609375 Z" />
        </clipPath>
        <clipPath id="cfm-2">
          <path d="M291.585938 619.75 L372 619.75 L372 683.878906 L291.585938 683.878906 Z" />
        </clipPath>
        <clipPath id="cfm-2c">
          <path d="M328.042969 683.878906 L372 683.878906 L335.671875 619.75 L291.714844 619.75 Z" />
        </clipPath>
        <clipPath id="cfm-3">
          <path d="M295.558594 744.433594 L384 744.433594 L384 824.519531 L295.558594 824.519531 Z" />
        </clipPath>
        <clipPath id="cfm-3c">
          <path d="M339.730469 744.433594 L383.902344 744.433594 L339.730469 824.519531 L295.558594 824.519531 Z" />
        </clipPath>
        <clipPath id="cfm-4">
          <path d="M351.273438 642.839844 L439.804688 642.839844 L439.804688 722.929688 L351.273438 722.929688 Z" />
        </clipPath>
        <clipPath id="cfm-4c">
          <path d="M395.632812 722.929688 L351.464844 722.929688 L395.632812 642.839844 L439.804688 642.839844 Z" />
        </clipPath>
        <clipPath id="cfm-5">
          <path d="M407.183594 703.390625 L495.71875 703.390625 L495.71875 783.480469 L407.183594 783.480469 Z" />
        </clipPath>
        <clipPath id="cfm-5c">
          <path d="M451.546875 783.480469 L407.375 783.480469 L451.546875 703.390625 L495.71875 703.390625 Z" />
        </clipPath>
        <clipPath id="cfm-6">
          <path d="M239.644531 683.882812 L328 683.882812 L328 763.96875 L239.644531 763.96875 Z" />
        </clipPath>
        <clipPath id="cfm-6c">
          <path d="M283.816406 683.882812 L327.988281 683.882812 L283.816406 763.96875 L239.644531 763.96875 Z" />
        </clipPath>
      </defs>
      <g clipPath="url(#cfm-1)">
        <g clipPath="url(#cfm-1c)">
          <rect x="363" y="783" width="82" height="66" fill="currentColor" />
        </g>
      </g>
      <g clipPath="url(#cfm-2)">
        <g clipPath="url(#cfm-2c)">
          <rect x="291" y="619" width="82" height="66" fill="currentColor" />
        </g>
      </g>
      <g clipPath="url(#cfm-3)">
        <g clipPath="url(#cfm-3c)">
          <rect x="295" y="744" width="90" height="82" fill="currentColor" />
        </g>
      </g>
      <g clipPath="url(#cfm-4)">
        <g clipPath="url(#cfm-4c)">
          <rect x="351" y="642" width="90" height="82" fill="currentColor" />
        </g>
      </g>
      <g clipPath="url(#cfm-5)">
        <g clipPath="url(#cfm-5c)">
          <rect x="407" y="703" width="90" height="82" fill="currentColor" />
        </g>
      </g>
      <g clipPath="url(#cfm-6)">
        <g clipPath="url(#cfm-6c)">
          <rect x="239" y="683" width="90" height="82" fill="currentColor" />
        </g>
      </g>
    </svg>
  );
}
