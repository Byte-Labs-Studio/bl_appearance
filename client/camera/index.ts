import { Camera, Vector3, CameraBones } from '@dataTypes/camera';
import {ped} from './../menu';

let running: boolean = false;
let camDistance: number = 1.2;
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

function cos(degrees: number): number {
    return Math.cos((degrees * Math.PI) / 180);
}

function sin(degrees: number): number {
    return Math.sin((degrees * Math.PI) / 180);
}

function setCamPosition(mouseX?: number, mouseY?: number): void {
    if (!running || !targetCoords || changingCam) return;

    mouseX = mouseX ?? 0.0;
    mouseY = mouseY ?? 0.0;

    angleZ -= mouseX;
    angleY += mouseY;
    angleY = Math.min(Math.max(angleY, 0.0), 89.0);

    const x =
        ((cos(angleZ) * cos(angleY)) + (cos(angleY) * cos(angleZ))) / 2 * camDistance;
    const y =
        ((sin(angleZ) * cos(angleY)) + (cos(angleY) * sin(angleZ))) / 2 * camDistance;
    const z = sin(angleY) * camDistance;

    SetCamCoord(cam, targetCoords.x + x, targetCoords.y + y, targetCoords.z + z)
    PointCamAtCoord(cam, targetCoords.x, targetCoords.y, targetCoords.z)
}

function moveCamera(coords: Vector3, heading?: number, distance?: number): void {
    heading = heading ?? GetEntityHeading(ped) + 100;
    distance = distance ?? 1.0;

    changingCam = true;
    camDistance = distance;

    const heading2: number = GetEntityHeading(ped) + 100;
    angleZ = heading ?? heading2;

    oldCam = cam;

    const x =
        ((cos(angleZ) * cos(angleY)) + (cos(angleY) * cos(angleZ))) / 2 * camDistance;
    const y =
        ((sin(angleZ) * cos(angleY)) + (cos(angleY) * sin(angleZ))) / 2 * camDistance;
    const z = sin(angleY) * camDistance;

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

    PointCamAtCoord(newcam, coords.x, coords.y, coords.z);
    SetCamActiveWithInterp(newcam, oldCam, 500, 1, 1);

    Wait(500);

    targetCoords = coords;
    changingCam = false;
    cam = newcam;

    SetCamUseShallowDofMode(cam, true);
    SetCamNearDof(cam, 0.4);
    SetCamFarDof(cam, 1.2);
    SetCamDofStrength(cam, 0.3);
    SetCamUseShallowDofMode(cam, true);

    useHiDof(cam)

    setCamPosition();
    DestroyCam(oldCam, true);
}

const useHiDof = (currentcam: Camera) => {
    if (!(DoesCamExist(cam) && currentcam == cam)) return;
    SetUseHiDof();
    setTimeout(useHiDof, 0);
}

export function startCamera(): void {
    if (running) return;
    running = true;

    const headingstart: number = GetEntityHeading(ped) + 100;

    camDistance = 1.2;
    cam = CreateCam("DEFAULT_SCRIPTED_CAMERA", true);

    RenderScriptCams(true, true, 500, true, true);

    const [x, y, z]: number[] = GetEntityCoords(ped, false);
    setCamPosition();
    moveCamera({x: x, y: y, z: z + 0.5}, headingstart, camDistance);
}

export function stopCamera(): void {
    if (!running) return;
    running = false;

    RenderScriptCams(false, true, 500, true, false);
    DestroyCam(cam, true);
    cam = null;
    targetCoords = null;
}

function setCamera(type?: keyof CameraBones): void {
    const bone: number | undefined = CameraBones[type];
    if (currentBone == type) return;
    const [x, y, z]: number[] = bone ? GetPedBoneCoords(ped, bone, 0.0, 0.0, 0.0) : GetEntityCoords(ped, false);

    moveCamera({
        x: x, 
        y: y, 
        z: z + 0.0
    }, GetEntityHeading(ped) + 100, 1.0);

    currentBone = type;
}

const setCameraByData = (data: any, cb: (result: number) => void): void => {
    const bone: number | undefined = CameraBones[data.type];
    const [x, y, z]: number[] = bone ? GetPedBoneCoords(ped, bone, 0.0, 0.0, 0.0) : GetEntityCoords(ped, false);

    moveCamera({
        x: x, 
        y: y, 
        z: z + 0.0
    }, GetEntityHeading(ped) + 100, 1.0);
    cb(1);
};

RegisterNuiCallback("cam:move", (data, cb) => {
    let heading: number = GetEntityHeading(ped);
    if (lastX == data.x) {
        return;
    }
    heading = data.x > lastX ? heading + 5 : heading - 5;
    SetEntityHeading(ped, heading);
    cb(1);
});

RegisterNuiCallback("cam:scroll", (data, cb) => {
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

RegisterNuiCallback("cam:zoom", (data, cb) => {
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

RegisterNuiCallback("cam:setCamera", setCameraByData);
