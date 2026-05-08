import SvgIcon from '@mui/material/SvgIcon';

// Proposta de logo feita com SVG (ajuda de IA) - Placeholder
export default function LogoIcon(props: React.ComponentProps<typeof SvgIcon>) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="#C2410C" />
      <path
        d="M4 13L12 18L20 13"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 4L4 9L12 14L20 9L12 4Z"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgIcon>
  );
}