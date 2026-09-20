import { loadFont as loadPoppins } from "@remotion/google-fonts/Poppins";
import { loadFont as loadJakarta } from "@remotion/google-fonts/PlusJakartaSans";

export const poppins = loadPoppins("normal", { weights: ["600", "700", "800"], subsets: ["latin"] }).fontFamily;
export const jakarta = loadJakarta("normal", { weights: ["500", "600"], subsets: ["latin"] }).fontFamily;

export const colors = {
  bg: "#f6f9fd",
  text: "#1c2b3a",
  textDim: "#51677c",
  sky: "#2f9bea",
  sky2: "#22d3ee",
  skyDeep: "#1c7fd0",
  card: "rgba(255,255,255,0.78)",
  line: "rgba(30,58,95,0.12)",
  pink: "#ff8fb3",
  mint: "#34d399",
};
