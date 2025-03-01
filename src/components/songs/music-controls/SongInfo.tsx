
interface SongInfoProps {
  title: string;
  artist: string;
}

export const SongInfo = ({ title, artist }: SongInfoProps) => {
  return (
    <div className="flex items-center justify-center space-x-4 w-full md:w-1/4">
      <div className="w-12 h-12 md:w-14 md:h-14 bg-[#282828] rounded flex items-center justify-center">
        <div className="text-xl md:text-2xl text-gray-400">🎵</div>
      </div>
      <div className="min-w-0 text-center md:text-left">
        <h3 className="font-semibold text-sm text-white truncate">{title}</h3>
        <p className="text-xs text-gray-400 truncate">{artist}</p>
      </div>
    </div>
  );
};
