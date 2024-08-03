import { Camera, Vector3, TCameraBones } from '@typings/camera';
import { delay, ped } from '@utils';
import { Receive } from '@events';

const WHOLE_BODY_MAX_DISTANCE = 2.0;
const DEFAULT_MAX_DISTANCE = 1.0;

let running: boolean = false;
let camDistance: number = 1.8;
let cam: Camera | null = null;
let angleY: number = 0.0;
let angleZ: number = 0.0;
let targetCoords: Vector3 | null = null;
let oldCam: Camera | null = null;
let changingCam: boolean = false;
let lastX: number = 0;
let currentBone: keyof TCameraBones = 'head';

const CameraBones: TCameraBones = {
    whole: 0,
	head: 31086,
	torso: 24818,
	legs: [16335, 46078],
    shoes: [14201, 52301],
};

const cos = (degrees: number): number => {
	return Math.cos((degrees * Math.PI) / 180);
};

const sin = (degrees: number): number => {
	return Math.sin((degrees * Math.PI) / 180);
};

const getAngles = (): number[] => {
	const x =
		((cos(angleZ) * cos(angleY) + cos(angleY) * cos(angleZ)) / 2) *
		camDistance;
	const y =
		((sin(angleZ) * cos(angleY) + cos(angleY) * sin(angleZ)) / 2) *
		camDistance;
	const z = sin(angleY) * camDistance;

	return [x, y, z];
};

const setCamPosition = (mouseX?: number, mouseY?: number): void => {
	if (!running || !targetCoords || changingCam) return;

	mouseX = mouseX ?? 0.0;
	mouseY = mouseY ?? 0.0;

	angleZ -= mouseX;
	angleY += mouseY;

    const isHeadOrWhole = currentBone === 'whole' || currentBone === 'head';
    const maxAngle = isHeadOrWhole ? 89.0 : 70.0;
    
    const isShoes = currentBone === 'shoes';
    const minAngle = isShoes ? 5.0 : -20.0;

	angleY = Math.min(Math.max(angleY, minAngle), maxAngle);

	const [x, y, z] = getAngles();

	SetCamCoord(
		cam,
		targetCoords.x + x,
		targetCoords.y + y,
		targetCoords.z + z
	);
	PointCamAtCoord(cam, targetCoords.x, targetCoords.y, targetCoords.z);
};

const moveCamera = async (coords: Vector3, distance?: number) => {
	const heading: number = GetEntityHeading(ped) + 94;
	distance = distance ?? 1.0;

	changingCam = true;
	camDistance = distance;
	angleZ = heading;

	const [x, y, z] = getAngles();

	const newcam: Camera = CreateCamWithParams(
		'DEFAULT_SCRIPTED_CAMERA',
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
	oldCam = cam;
	cam = newcam;

	PointCamAtCoord(newcam, coords.x, coords.y, coords.z);
	SetCamActiveWithInterp(newcam, oldCam, 250, 0, 0);

	await delay(250);

	SetCamUseShallowDofMode(newcam, true);
	SetCamNearDof(newcam, 0.4);
	SetCamFarDof(newcam, 1.2);
	SetCamDofStrength(newcam, 0.3);
	useHiDof(newcam);

	DestroyCam(oldCam, true);
};

const useHiDof = (currentcam: Camera) => {
	if (!(DoesCamExist(cam) && currentcam == cam)) return;
	SetUseHiDof();
	setTimeout(useHiDof, 0);
};

export const startCamera = () => {
	if (running) return;
	running = true;
	camDistance = WHOLE_BODY_MAX_DISTANCE
	cam = CreateCam('DEFAULT_SCRIPTED_CAMERA', true);
	const [x, y, z]: number[] = GetPedBoneCoords(ped, 31086, 0.0, 0.0, 0.0);
	SetCamCoord(cam, x, y, z);
	RenderScriptCams(true, true, 1000, true, true);
	// moveCamera({ x: x, y: y, z: z }, camDistance);
    setCamera('whole', camDistance);
};

export const stopCamera = (): void => {
	if (!running) return;
	running = false;

	RenderScriptCams(false, true, 250, true, false);
	DestroyCam(cam, true);
	cam = null;
	targetCoords = null;
};

const setCamera = (type?: keyof TCameraBones, distance = camDistance): void => {

	const bone: number | number[] | undefined = CameraBones[type];

    const isBoneArray = Array.isArray(bone)

    currentBone = type;

    if (!isBoneArray && bone === 0) {
        const [x, y, z]: number[] = GetEntityCoords(ped, false);
        moveCamera(
            {
                x: x,
                y: y,
                z: z + 0.0,
            },
            distance
        );
        return;
    }

    // If its not whole body, then we need to limit the distance
    if (distance > DEFAULT_MAX_DISTANCE) distance = DEFAULT_MAX_DISTANCE;

    if (isBoneArray) {
        const [x1, y1, z1]: number[] = GetPedBoneCoords(ped, bone[0], 0.0, 0.0, 0.0)

        const [x2, y2, z2]: number[] = GetPedBoneCoords(ped, bone[1], 0.0, 0.0, 0.0)

        // get the middle of the two points
        var x = (x1 + x2) / 2;
        var y = (y1 + y2) / 2;
        var z = (z1 + z2) / 2;
    } else {
        var [x, y, z]: number[] = GetPedBoneCoords(ped, bone, 0.0, 0.0, 0.0)
    }

	moveCamera(
		{
			x: x,
			y: y,
			z: z + 0.0,
		},
		distance
	);

};

RegisterNuiCallback(Receive.camMove, (data, cb) => {
    setCamPosition(data.x, data.y);
    cb(1);
});

type TSection = 'whole' | 'head' | 'torso' | 'legs' | 'shoes';

RegisterNuiCallback(Receive.camSection, (type: TSection, cb: Function) => {
	switch (type) {
        case 'whole':
            setCamera('whole', WHOLE_BODY_MAX_DISTANCE);
            break;
        case 'head':
            setCamera('head');
            break;
        case 'torso':
            setCamera('torso');
            break;
        case 'legs':
            setCamera('legs');
            break;
        case 'shoes':
            setCamera('shoes');
            setCamPosition();
            break;
	}
	cb(1);
});

RegisterNuiCallback(Receive.camZoom, (data, cb) => {
	if (data === 'down') {

        const maxZoom = currentBone === 'whole' ? WHOLE_BODY_MAX_DISTANCE : DEFAULT_MAX_DISTANCE;

		const newDistance: number = camDistance + 0.05;
		camDistance = newDistance >= maxZoom ? maxZoom : newDistance;
	} else if (data === 'up') {
		const newDistance: number = camDistance - 0.05;
		camDistance = newDistance <= 0.3 ? 0.3 : newDistance;
	}

	camDistance = camDistance;
	setCamPosition();
	cb(1);
});
