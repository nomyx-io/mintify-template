const GenerateSvgIcon = ({ color }: { color: string }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 560 560">
      <defs>
        <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor="#003366" stopOpacity="1" />
        </linearGradient>
      </defs>
      <rect width="560" height="560" rx="15" fill={`url(#gradient-${color})`} />
      <text
        x="50%"
        y="50%" // Adjusted to bring text to vertical center
        fontFamily="Arial, sans-serif"
        fontWeight="bold"
        fontSize="300" // Increased font size to make "KC" bigger
        fill="white"
        dominantBaseline="middle"
        textAnchor="middle"
      >
        KC
      </text>
    </svg>
  );
};

export { GenerateSvgIcon };
