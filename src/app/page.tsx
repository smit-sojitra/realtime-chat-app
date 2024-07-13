import { db } from "@/lib/db";
import Image from "next/image";
import ToggleSwitch from "./components/ToggleSwitch";
import Link from "next/link";

export default async function Home() {
  
  return (
    <div className="text-red-500 bg  text-center">
      <p>Hello</p>
      <ToggleSwitch/>
    </div>
  );
}
