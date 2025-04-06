import { vec3 } from "gl-matrix";
import { Camera } from "./camera";
import { debounce } from './debounce';
import { ObjProcessor } from "./model/objprocessor";
import { RayTracer } from "./raytracer";
import { DEFAULT_PARTICLE_COLOR, DEFAULT_PARTICLE_SIZE, Settings } from "./settings";

export class UiHandler {
    private settings: Settings;
    private camera: Camera;
    private rayTracer: RayTracer;
    private resetSceneCallback: () => void;
    private dropObjectCallback: (position: vec3) => void;

    constructor(camera: Camera, resetSceneCallback: () => void, dropObjectCallback: (position: vec3) => void) {
        this.settings = Settings.getInstance();
        this.camera = camera;
        this.rayTracer = new RayTracer(camera);
        this.resetSceneCallback = debounce(resetSceneCallback, 100);
        this.dropObjectCallback = dropObjectCallback;
        this.initializeSliders();
        this.initializeKeyControls();
        this.initializeObjUpload();
        this.initializeColorPicker();
        this.initializeButtons();
        this.initializeCheckboxes();
        this.initializeClickHandler();
    }

    private initializeClickHandler() {
        const canvas = document.getElementById('canvas') as HTMLCanvasElement;
        if(canvas) {
            canvas.addEventListener('click', (event) => {
                if(this.settings.getSettings().dropGravityWell) {
                    const intersection = this.rayTracer.computeClickIntersection(event);
                    if(intersection){
                        const intersectionPoint = vec3.fromValues(intersection[0], intersection[1], intersection[2]);
                        this.dropObjectCallback(intersectionPoint);
                    }
                }
            })
        }
    }

    private initializeButtons() {
        this.setupButton('clearSizeBtn', () => {
            const sizeSlider = document.getElementById('particleSizeSlider') as HTMLInputElement;
            const sizeDisplay = document.getElementById('particleSizeValue');
            if(sizeSlider && sizeDisplay)   {
                sizeDisplay.innerText = DEFAULT_PARTICLE_SIZE.toString();
                sizeSlider.value = DEFAULT_PARTICLE_SIZE.toString();
            }
            this.settings.getSettings().particleSize = DEFAULT_PARTICLE_SIZE;
            if(!this.settings.getSettings().randomSize) this.resetSceneCallback();
        });
        this.setupButton('clearColorBtn', () => {
            const colorPicker = document.getElementById('particleColor') as HTMLInputElement;
            this.settings.getSettings().particleColor = DEFAULT_PARTICLE_COLOR;
            colorPicker.value = '#FFFFFF';
            if(!this.settings.getSettings().randomColor) this.resetSceneCallback();
        });
    }

    private initializeCheckboxes() {
        this.setupCheckbox('randomSizeCheckbox', (checked) => {
            this.settings.getSettings().randomSize = checked;
            this.resetSceneCallback();
        });
        this.setupCheckbox('randomColorCheckbox', (checked) => {
            this.settings.getSettings().randomColor = checked;
            this.resetSceneCallback();
        });
        this.setupCheckbox('collisionsCheckbox', (checked) => {
            this.settings.getSettings().particleCollisions = checked;
            this.resetSceneCallback();
        });
        this.setupCheckbox('gravityWellCheckbox', (checked) => {
            this.settings.getSettings().dropGravityWell = checked;
        });
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
        this.setupSlider("particleSizeSlider", "particleSizeValue", (value) => {
            const lastValue = this.settings.getSettings().particleSize;
            this.settings.getSettings().particleSize = value;
            const settingValue = this.settings.getSettings();
            if(!settingValue.randomSize && lastValue !== settingValue.particleSize) {
                this.resetSceneCallback();
            }
            return value.toString();
        });
        this.setupSlider("totalParticlesSlider", "totalParticlesValue", (value) => {
            const lastValue = this.settings.getSettings().totalParticles;
            this.settings.getSettings().totalParticles = value;
            if(lastValue !== value) this.resetSceneCallback();
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

    private setupButton(buttonId: string, onClick: () => void) {
        const button = document.getElementById(buttonId) as HTMLButtonElement;
        if(button) button.addEventListener('click', onClick);
    }

    private setupCheckbox(checkboxId: string, onChange: (checked: boolean) => void) {
        const checkbox = document.getElementById(checkboxId) as HTMLInputElement;
        if(checkbox) checkbox.addEventListener('change', (event) => onChange((event.target as HTMLInputElement).checked));
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

    private initializeColorPicker() {
        const colorPicker = document.getElementById('particleColor') as HTMLInputElement;
        if (colorPicker) {
            colorPicker.addEventListener('input', (event) => {
                const selectedColor = (event.target as HTMLInputElement).value;
                const r = parseInt(selectedColor.slice(1, 3), 16) / 255;
                const g = parseInt(selectedColor.slice(3, 5), 16) / 255;
                const b = parseInt(selectedColor.slice(5, 7), 16) / 255;
                this.settings.getSettings().particleColor = vec3.fromValues(r, g, b);
                if(!this.settings.getSettings().randomColor) this.resetSceneCallback();
            });
        }
    }
}
