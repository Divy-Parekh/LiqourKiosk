import { Environment, OrbitControls} from "@react-three/drei";
import { Avatar } from "./Avatar";
import { useThree } from "@react-three/fiber";

export const Experience = () => {

  const viewport = useThree((state)=> state.viewport);

  return (
    <>
      <OrbitControls />
      <Avatar position={[0, -3, 5]} scale={2}  />
      <Environment preset="sunset"/>
      
    </>
  );
};


