// Loads the default brand fonts via @remotion/google-fonts (blocks render until ready).
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadPoppins } from "@remotion/google-fonts/Poppins";

loadInter("normal", { weights: ["400", "600", "800", "900"], subsets: ["latin", "latin-ext"] });
loadPlayfair("italic", { weights: ["400", "700", "900"], subsets: ["latin", "latin-ext"] });
loadPoppins("normal", { weights: ["400", "600", "800"], subsets: ["latin", "latin-ext"] });
