import Game from "./components/Game";
import Welcome from "./components/Welcome";

export default function Home() {

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <Welcome/>
        <Game />
    </main>
  );
}
