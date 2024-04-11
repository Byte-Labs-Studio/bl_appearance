import { Camera, Vector3, CameraBones } from '@dataTypes/camera';
import {ped} from './../menu';
import { delay} from '@utils';
import { receive } from '@enums';

let running: boolean = false;
let camDistance: number = 1.8;
let cam: Camera | null = null;
let angleY: number = 0.0;
let angleZ: number = 0.0;
let targetCoords: Vector3 | null = null;
let oldCam: Camera | null = null;
let changingCam: boolean = false;
let lastX: number = 0;
let currentBone: keyof CameraBones = 'head'

const CameraBones: CameraBones = {
    head: 31086,
    torso: 24818,
    legs: 46078,
};

const cos = (degrees: number): number => {
    return Math.cos((degrees * Math.PI) / 180);
}

const sin = (degrees: number): number => {
    return Math.sin((degrees * Math.PI) / 180);
}

const getAngles = (): number[] => {
    const x =((cos(angleZ) * cos(angleY)) + (cos(angleY) * cos(angleZ))) / 2 * camDistance;
    const y = ((sin(angleZ) * cos(angleY)) + (cos(angleY) * sin(angleZ))) / 2 * camDistance;
    const z = sin(angleY) * camDistance;

    return [x, y, z]
}


const setCamPosition = (mouseX?: number, mouseY?: number): void => {
    if (!running || !targetCoords || changingCam) return;

    mouseX = mouseX ?? 0.0;
    mouseY = mouseY ?? 0.0;

    angleZ -= mouseX;
    angleY += mouseY;
    angleY = Math.min(Math.max(angleY, 0.0), 89.0);

    const [x, y, z] = getAngles()

    SetCamCoord(cam, targetCoords.x + x, targetCoords.y + y, targetCoords.z + z)
    PointCamAtCoord(cam, targetCoords.x, targetCoords.y, targetCoords.z)
}

const moveCamera = async (coords: Vector3, distance?: number) => {
    const heading: number = GetEntityHeading(ped) + 94;
    distance = distance ?? 1.0;

    changingCam = true;
    camDistance = distance;
    angleZ = heading;

    const [x, y, z] = getAngles()

    console.log(x, y, z)
    const newcam: Camera = CreateCamWithParams(
        "DEFAULT_SCRIPTED_CAMERA",
        coords.x + x,
        coords.y + y,
        coords.z + z,
        0.0,
        0.0,
        0.0,
        70.0,
        false,
        0
    );

    targetCoords = coords;
    changingCam = false;
    oldCam = cam
    cam = newcam;

    PointCamAtCoord(newcam, coords.x, coords.y, coords.z);
    SetCamActiveWithInterp(newcam, oldCam, 250, 0, 0);

    await delay(250)

    SetCamUseShallowDofMode(newcam, true);
    SetCamNearDof(newcam, 0.4);
    SetCamFarDof(newcam, 1.2);
    SetCamDofStrength(newcam, 0.3);
    useHiDof(newcam);

    DestroyCam(oldCam, true);
}

const useHiDof = (currentcam: Camera) => {
    if (!(DoesCamExist(cam) && currentcam == cam)) return;
    SetUseHiDof();
    setTimeout(useHiDof, 0);
}

export const startCamera = async () => {
    if (running) return;
    running = true;
    camDistance = 1.2;
    cam = CreateCam("DEFAULT_SCRIPTED_CAMERA", true);
    const [x, y, z]: number[] = GetEntityCoords(ped, false);
    SetCamCoord(cam, x, y, z)
    RenderScriptCams(true, true, 1000, true, true);
    moveCamera({x: x, y: y, z: z + 0.5}, camDistance);
}

export const stopCamera = (): void => {
    if (!running) return;
    running = false;

    RenderScriptCams(false, true, 250, true, false);
    DestroyCam(cam, true);
    cam = null;
    targetCoords = null;
}

const setCamera = (type?: keyof CameraBones): void => {
    const bone: number | undefined = CameraBones[type];
    if (currentBone == type) return;
    const [x, y, z]: number[] = bone ? GetPedBoneCoords(ped, bone, 0.0, 0.0, 0.0) : GetEntityCoords(ped, false);

    moveCamera({
        x: x, 
        y: y, 
        z: z + 0.0
    }, 1.0);

    currentBone = type;
}

RegisterNuiCallback(receive.camMove, (data, cb) => {
    cb(1)
    let heading: number = GetEntityHeading(ped);
    if (lastX == data.x) {
        return;
    }
    heading = data.x > lastX ? heading + 5 : heading - 5;
    SetEntityHeading(ped, heading);
});

RegisterNuiCallback(receive.camScroll, (data, cb) => {
    switch (data) {
        case 2:
            setCamera();
            break;
        case 1:
            setCamera("legs");
            break;
        case 3:
            setCamera("head");
            break;
    }
    cb(1);
});

RegisterNuiCallback(receive.camZoom, (data, cb) => {
    if (data === "down") {
        const newDistance: number = camDistance + 0.05;
        camDistance = newDistance >= 1.0 ? 1.0 : newDistance;
    } else if (data === "up") {
        const newDistance: number = camDistance - 0.05;
        camDistance = newDistance <= 0.35 ? 0.35 : newDistance;
    }

    camDistance = camDistance;
    setCamPosition();
    cb(1);
});

