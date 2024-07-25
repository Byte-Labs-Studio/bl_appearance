type Camera = number

type Vector3 = {
    x: number;
    y: number;
    z: number;
};

interface TCameraBones {
    whole: number; // SKEL_Root
    head: number; // SKEL_Head
    torso: number; // SKEL_Spine3
    legs: number[]; // SKEL_Root
    shoes: number[]; // SKEL_Root
}

export {Camera, Vector3, TCameraBones}
