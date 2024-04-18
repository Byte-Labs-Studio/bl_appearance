type Camera = number

type Vector3 = {
    x: number;
    y: number;
    z: number;
};

interface CameraBones {
    head: number; // SKEL_Head
    torso: number; // SKEL_Spine3
    legs: number; // SKEL_Root
}

export {Camera, Vector3, CameraBones}
