export default function About() {
  return (
    <div className="w-full">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
            About
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Learn more about RailMap and its mission.
          </p>
        </div>
        
        <div className="bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 p-8">
          <p className="text-zinc-600 dark:text-zinc-400">
            About content will be displayed here.
          </p>
        </div>
      </div>
    </div>
  );
}

