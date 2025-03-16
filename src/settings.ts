type SettingsValue = {
    gravitationalCoefficient: number;
    maxSpeed: number;
    windX: number;
    windZ: number;
}

export class Settings {
    private static instance: Settings;

    private settings: SettingsValue = {
        gravitationalCoefficient: 6.67430e-10,
        maxSpeed: 0.001,
        windX: 0,
        windZ: 0,
    };

    private constructor() {}

    public static getInstance(): Settings {
        if (!Settings.instance) {
            Settings.instance = new Settings();
        }
        return Settings.instance;
    }

    public getSettings(): SettingsValue {
        return this.settings;
    }
}