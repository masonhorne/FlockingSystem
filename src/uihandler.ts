import { Camera } from "./camera";
import { ObjProcessor } from "./model/objprocessor";
import { Settings } from "./settings";

export class UiHandler {
    private settings: Settings;
    private camera: Camera;
    private resetSceneCallback: () => void;

    constructor(camera: Camera, resetSceneCallback: () => void) {
        this.settings = Settings.getInstance();
        this.camera = camera;
        this.resetSceneCallback = resetSceneCallback;
        this.initializeSliders();
        this.initializeKeyControls();
        this.initializeObjUpload();
    }

    private initializeSliders() {
        this.setupSlider("gravitySlider", "gravityValue", (value) => {
            const scaledValue = 6.67430 * Math.pow(10, value);
            this.settings.getSettings().gravitationalCoefficient = scaledValue;
            return scaledValue.toExponential(4);
        });

        this.setupSlider("windXSlider", "windXValue", (value) => {
            this.settings.getSettings().windX = value;
            return value.toString();
        });

        this.setupSlider("windZSlider", "windZValue", (value) => {
            this.settings.getSettings().windZ = value;
            return value.toString();
        });
        this.setupSlider("maxSpeedSlider", "maxSpeedValue", (value) => {
            this.settings.getSettings().maxSpeed = value;
            return value.toString();
        });
    }

    private setupSlider(sliderId: string, valueId: string, onChange: (value: number) => string) {
        const slider = document.getElementById(sliderId) as HTMLInputElement;
        const valueDisplay = document.getElementById(valueId);
        if (slider && valueDisplay) {
            const update = (value: number) => {
                const displayText = onChange(value);
                valueDisplay.innerText = displayText;
            };
            slider.onchange = (event) => update(parseFloat((event.target as HTMLInputElement).value));
            slider.onmousemove = (event) => update(parseFloat((event.target as HTMLInputElement).value));
            update(parseFloat(slider.value));
        }
    }

    private initializeKeyControls() {
        document.addEventListener('keydown', (event: KeyboardEvent) => {
            switch (event.key) {
                case "w": this.camera.moveForward(); break;
                case "W": this.camera.tiltUp(); break;
                case "s": this.camera.moveBackward(); break;
                case "S": this.camera.tiltDown(); break;
                case "a": this.camera.moveLeft(); break;
                case "A": this.camera.tiltLeft(); break;
                case "d": this.camera.moveRight(); break;
                case "D": this.camera.tiltRight(); break;
            }
        });
    }

    private initializeObjUpload() {
        const objFileInput = document.getElementById('objFileUpload') as HTMLInputElement;
        if (objFileInput) {
            objFileInput.addEventListener('change', () => {
                if (objFileInput.files && objFileInput.files[0]) {
                    const file = objFileInput.files[0];
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const objData = e.target?.result as string;
                        this.settings.getSettings().customModelData = ObjProcessor.processObj(objData);
                        this.resetSceneCallback();
                    };
                    reader.readAsText(file);
                } else {
                    this.settings.getSettings().customModelData = undefined;
                    this.resetSceneCallback();
                }
            });
        }
    }
}
