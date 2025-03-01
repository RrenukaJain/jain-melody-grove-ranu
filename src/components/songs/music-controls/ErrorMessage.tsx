
interface ErrorMessageProps {
  message: string | null;
}

export const ErrorMessage = ({ message }: ErrorMessageProps) => {
  if (!message) return null;
  
  return (
    <div className="absolute top-0 left-0 right-0 bg-red-500 text-white text-sm py-1 px-4 text-center transform -translate-y-full">
      {message}
    </div>
  );
};
