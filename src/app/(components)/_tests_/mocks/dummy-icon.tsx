interface IconProps {
  "aria-label"?: string;
  className?: string;
  fill?: string;
  size?: number;
  verticalAlign?: "middle" | "text-bottom" | "text-top" | "top" | "unset";
}

export const DummyIcon = (props: IconProps) => {
  return (
    <svg {...props}>
      <circle
        cx="50"
        cy="50"
        r="40"
        stroke="green"
        strokeWidth="4"
        fill="yellow"
      />
    </svg>
  );
};
