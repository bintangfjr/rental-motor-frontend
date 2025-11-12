import React from "react";
import { cn } from "../../utils/cn";
import { useTheme } from "../../hooks/useTheme";

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "animation"> {
  variant?:
    | "primary"
    | "secondary"
    | "success"
    | "warning" // ✅ TAMBAHKAN: Variant warning
    | "danger"
    | "outline"
    | "ghost"
    | "modern";
  size?: "sm" | "md" | "lg" | "xl";
  isLoading?: boolean;
  withRipple?: boolean;
  animation?: "none" | "pulse" | "bounce" | "slide" | "glow" | "send";
  sent?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  withRipple = true,
  animation = "none",
  sent = false,
  className,
  disabled,
  onClick,
  ...props
}) => {
  const { isDark } = useTheme();
  const [isRippling, setIsRippling] = React.useState(false);
  const [coords, setCoords] = React.useState({ x: -1, y: -1 });
  const [isSent, setIsSent] = React.useState(sent);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  // Handle sent state changes
  React.useEffect(() => {
    setIsSent(sent);
  }, [sent]);

  // ✅ Ripple effect handler
  const handleRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!withRipple || isLoading || disabled) return;

    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;

    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsRippling(true);

    setTimeout(() => setIsRippling(false), 600);

    // Call original onClick if provided
    if (onClick) {
      onClick(e);
    }
  };

  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden";

  // ✅ PERBAIKAN: Tambah variant warning dan perbaiki konsistensi
  const variantStyles: Record<string, string> = {
    primary: cn(
      "border-2 shadow-sm hover:shadow-md transition-all duration-200",
      isDark
        ? "text-blue-300 border-blue-600 hover:text-blue-200 hover:border-blue-500 focus:ring-blue-500 bg-blue-900/20"
        : "text-blue-600 border-blue-600 hover:text-blue-700 hover:border-blue-700 focus:ring-blue-500 bg-transparent"
    ),
    secondary: cn(
      "border-2 shadow-sm hover:shadow-md transition-all duration-200",
      isDark
        ? "text-gray-300 border-gray-600 hover:text-gray-200 hover:border-gray-500 focus:ring-gray-500 bg-gray-800/20"
        : "text-gray-600 border-gray-600 hover:text-gray-700 hover:border-gray-700 focus:ring-gray-500 bg-transparent"
    ),
    success: cn(
      "border-2 shadow-sm hover:shadow-md transition-all duration-200",
      isDark
        ? "text-green-300 border-green-600 hover:text-green-200 hover:border-green-500 focus:ring-green-500 bg-green-900/20"
        : "text-green-600 border-green-600 hover:text-green-700 hover:border-green-700 focus:ring-green-500 bg-transparent"
    ),
    // ✅ TAMBAHKAN: Variant warning untuk tombol "Selesaikan (Lewat Tempo)"
    warning: cn(
      "border-2 shadow-sm hover:shadow-md transition-all duration-200",
      isDark
        ? "text-yellow-300 border-yellow-600 hover:text-yellow-200 hover:border-yellow-500 focus:ring-yellow-500 bg-yellow-900/20"
        : "text-yellow-600 border-yellow-600 hover:text-yellow-700 hover:border-yellow-700 focus:ring-yellow-500 bg-transparent"
    ),
    danger: cn(
      "border-2 shadow-sm hover:shadow-md transition-all duration-200",
      isDark
        ? "text-red-300 border-red-600 hover:text-red-200 hover:border-red-500 focus:ring-red-500 bg-red-900/20"
        : "text-red-600 border-red-600 hover:text-red-700 hover:border-red-700 focus:ring-red-500 bg-transparent"
    ),
    outline: cn(
      "border shadow-sm hover:shadow-md transition-all duration-200",
      isDark
        ? "text-gray-300 border-gray-600 hover:text-gray-200 hover:border-gray-500 focus:ring-gray-500 bg-transparent"
        : "text-gray-700 border-gray-300 hover:text-gray-900 hover:border-gray-400 focus:ring-gray-500 bg-transparent"
    ),
    ghost: cn(
      "transition-all duration-200",
      isDark
        ? "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 focus:ring-gray-500"
        : "text-gray-600 hover:text-gray-800 hover:bg-gray-50 focus:ring-gray-500"
    ),
    modern: cn(
      "border-0 shadow-lg hover:shadow-xl transform transition-all duration-200",
      isDark
        ? "text-white bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 focus:ring-purple-500"
        : "text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:ring-purple-500"
    ),
  };

  const sizeStyles: Record<string, string> = {
    sm: "px-3 py-1.5 text-xs rounded-lg",
    md: "px-5 py-2.5 text-sm rounded-xl",
    lg: "px-7 py-3.5 text-base rounded-2xl",
    xl: "px-9 py-4 text-lg rounded-2xl",
  };

  // ✅ Animation styles dengan dark theme support
  const animationStyles: Record<string, string> = {
    none: "",
    pulse: "animate-pulse hover:animate-none",
    bounce: "hover:animate-bounce",
    slide: "hover:translate-x-1",
    glow: cn(
      "shadow-lg hover:shadow-xl transition-all duration-300",
      isDark ? "hover:shadow-blue-500/25" : "hover:shadow-blue-500/25"
    ),
    send: "relative bg-transparent border-none shadow-none",
  };

  // ✅ PERBAIKAN: Hover effects yang konsisten untuk SEMUA tombol
  const hoverEffects = cn(
    "hover:scale-105 active:scale-95 transition-transform duration-200",
    variant === "modern" && "hover:-translate-y-0.5"
  );

  // Focus ring colors untuk dark mode
  const focusRing = isDark
    ? "focus:ring-offset-gray-900"
    : "focus:ring-offset-white";

  // Send icon SVG
  const SendIcon = () => (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#sendShadow)">
        <path
          d="M14.2199 21.63C13.0399 21.63 11.3699 20.8 10.0499 16.83L9.32988 14.67L7.16988 13.95C3.20988 12.63 2.37988 10.96 2.37988 9.78001C2.37988 8.61001 3.20988 6.93001 7.16988 5.60001L15.6599 2.77001C17.7799 2.06001 19.5499 2.27001 20.6399 3.35001C21.7299 4.43001 21.9399 6.21001 21.2299 8.33001L18.3999 16.82C17.0699 20.8 15.3999 21.63 14.2199 21.63ZM7.63988 7.03001C4.85988 7.96001 3.86988 9.06001 3.86988 9.78001C3.86988 10.5 4.85988 11.6 7.63988 12.52L10.1599 13.36C10.3799 13.43 10.5599 13.61 10.6299 13.83L11.4699 16.35C12.3899 19.13 13.4999 20.12 14.2199 20.12C14.9399 20.12 16.0399 19.13 16.9699 16.35L19.7999 7.86001C20.3099 6.32001 20.2199 5.06001 19.5699 4.41001C18.9199 3.76001 17.6599 3.68001 16.1299 4.19001L7.63988 7.03001Z"
          fill="currentColor"
        ></path>
        <path
          d="M10.11 14.4C9.92005 14.4 9.73005 14.33 9.58005 14.18C9.29005 13.89 9.29005 13.41 9.58005 13.12L13.16 9.53C13.45 9.24 13.93 9.24 14.22 9.53C14.51 9.82 14.51 10.3 14.22 10.59L10.64 14.18C10.5 14.33 10.3 14.4 10.11 14.4Z"
          fill="currentColor"
        ></path>
      </g>
      <defs>
        <filter id="sendShadow">
          <feDropShadow dx="0" dy="1" stdDeviation="0.6" floodOpacity="0.5" />
        </filter>
      </defs>
    </svg>
  );

  // Success icon SVG
  const SuccessIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      height="1em"
      width="1em"
      strokeWidth="0.5px"
    >
      <g filter="url(#successShadow)">
        <path
          fill="currentColor"
          d="M12 22.75C6.07 22.75 1.25 17.93 1.25 12C1.25 6.07 6.07 1.25 12 1.25C17.93 1.25 22.75 6.07 22.75 12C22.75 17.93 17.93 22.75 12 22.75ZM12 2.75C6.9 2.75 2.75 6.9 2.75 12C2.75 17.1 6.9 21.25 12 21.25C17.1 21.25 21.25 17.1 21.25 12C21.25 6.9 17.1 2.75 12 2.75Z"
        ></path>
        <path
          fill="currentColor"
          d="M10.5795 15.5801C10.3795 15.5801 10.1895 15.5001 10.0495 15.3601L7.21945 12.5301C6.92945 12.2401 6.92945 11.7601 7.21945 11.4701C7.50945 11.1801 7.98945 11.1801 8.27945 11.4701L10.5795 13.7701L15.7195 8.6301C16.0095 8.3401 16.4895 8.3401 16.7795 8.6301C17.0695 8.9201 17.0695 9.4001 16.7795 9.6901L11.1095 15.3601C10.9695 15.5001 10.7795 15.5801 10.5795 15.5801Z"
        ></path>
      </g>
      <defs>
        <filter id="successShadow">
          <feDropShadow dx="0" dy="1" stdDeviation="0.6" floodOpacity="0.5" />
        </filter>
      </defs>
    </svg>
  );

  // Character animation component
  const AnimatedText = ({ text, state }: { text: string; state: string }) => (
    <p className="flex">
      {text.split("").map((char, index) => (
        <span
          key={index}
          className="inline-block transition-all duration-500 ease-out"
          style={{
            transitionDelay:
              state === "default"
                ? `calc(0.1s * ${index})`
                : `calc(0.1s * ${text.length - index})`,
            transform: state === "sent" ? "translateY(-100%)" : "translateY(0)",
            opacity: state === "sent" ? "0" : "1",
          }}
        >
          {char}
        </span>
      ))}
    </p>
  );

  if (animation === "send") {
    const sendButtonColor = isDark ? "text-blue-400" : "text-blue-600";
    const sendOutlineColor = isDark ? "border-blue-500" : "border-blue-500";

    return (
      <button
        ref={buttonRef}
        className={cn(
          "button relative bg-transparent border-none cursor-pointer px-6 py-3 rounded-xl transition-all duration-500 group",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          focusRing,
          "disabled:opacity-50 disabled:cursor-not-allowed",
          isSent && "sent",
          sendButtonColor,
          className
        )}
        disabled={disabled || isLoading}
        onClick={(e) => {
          if (!isLoading && !disabled) {
            setIsSent(true);
            setTimeout(() => setIsSent(false), 3000);
          }
          handleRipple(e);
        }}
        {...props}
      >
        {/* Outline effect */}
        <div
          className={cn(
            "outline absolute inset-0 rounded-xl border-2 transition-all duration-300",
            sendOutlineColor,
            "group-hover:scale-105",
            isDark
              ? "group-hover:border-blue-400"
              : "group-hover:border-blue-600",
            isSent && "scale-110 border-green-500 opacity-0"
          )}
        />

        {/* Default state */}
        <div
          className={cn(
            "state state--default flex items-center gap-2 transition-all duration-500",
            isSent && "opacity-0 -translate-y-full"
          )}
        >
          <div className="icon">
            <SendIcon />
          </div>
          <AnimatedText
            text={typeof children === "string" ? children : "Send Message"}
            state={isSent ? "sent" : "default"}
          />
        </div>

        {/* Sent state */}
        <div
          className={cn(
            "state state--sent absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 transition-all duration-500",
            isSent ? "opacity-100" : "opacity-0 translate-y-full"
          )}
        >
          <div className="icon text-green-500">
            <SuccessIcon />
          </div>
          <AnimatedText text="Sent" state={isSent ? "default" : "sent"} />
        </div>

        {/* Ripple Effect */}
        {isRippling && (
          <span
            className="absolute bg-current opacity-30 rounded-full animate-ripple"
            style={{
              left: coords.x,
              top: coords.y,
              width: "20px",
              height: "20px",
              transform: "scale(0)",
            }}
          />
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-current border-t-transparent" />
          </div>
        )}
      </button>
    );
  }

  // Regular button rendering for other animation types
  return (
    <button
      ref={buttonRef}
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        animationStyles[animation],
        hoverEffects,
        focusRing,
        "group",
        className
      )}
      disabled={disabled || isLoading}
      onClick={handleRipple}
      {...props}
    >
      {/* ✅ Ripple Effect */}
      {isRippling && (
        <span
          className="absolute bg-current opacity-30 rounded-full animate-ripple"
          style={{
            left: coords.x,
            top: coords.y,
            width: "20px",
            height: "20px",
            transform: "scale(0)",
          }}
        />
      )}

      {/* ✅ Loading Spinner with Modern Design */}
      {isLoading && (
        <div className="mr-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
        </div>
      )}

      {/* ✅ PERBAIKAN: Button Content - Hapus efek translate yang tidak konsisten */}
      <span
        className={cn(
          "flex items-center gap-2 transition-all duration-300",
          isLoading ? "opacity-0" : "opacity-100"
          // Hapus: "group-hover:translate-x-0.5" karena menyebabkan pergeseran tidak konsisten
        )}
      >
        {children}

        {/* ✅ PERBAIKAN: Hapus arrow icon untuk tombol aksi agar konsisten */}
        {/* 
        {variant !== "modern" && !isLoading && (
          <svg
            className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 opacity-0 group-hover:opacity-100"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        )}
        */}
      </span>

      {/* ✅ Modern Button Shine Effect */}
      {variant === "modern" && (
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <div
            className={cn(
              "absolute -inset-full top-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 group-hover:animate-shine",
              isDark && "opacity-10"
            )}
          />
        </div>
      )}
    </button>
  );
};

export default Button;
