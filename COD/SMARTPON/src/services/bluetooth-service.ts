import { BleClient, dataViewToText, textToDataView, type BleDevice } from "@capacitor-community/bluetooth-le"
import { Preferences } from "@capacitor/preferences"
import type { AccessRequest, AccessResponse } from "@data-types/access";



const SERVICE_UUID        = "0000180a-0000-1000-8000-00805f9b34fb";
const WRITE_CHAR_UUID     = "00002a29-0000-1000-8000-00805f9b34fb"; // mobile → ESP32
const NOTIFY_CHAR_UUID    = "00002a28-0000-1000-8000-00805f9b34fb"; // ESP32 → mobile



/**
 * Handles BLE connection and messaging to the ESP.
 */
export class BluetoothService 
{
    private device: BleDevice | null = null
    private initialized = false


    /**
     * Scan for all devices available for BLE.
     */
    async scanAll(): Promise<void> 
    {
        await this.initialize()
        
        await BleClient.requestLEScan(
            { allowDuplicates: false },
            (result) => 
            {
                console.log("Device found:", JSON.stringify({
                    name: result.device.name,
                    deviceId: result.device.deviceId,
                    rssi: result.rssi,
                    services: result.uuids
                }));
            }
        );

        setTimeout(async () => 
        {
            await BleClient.stopLEScan()
            console.log("Scan stopped")
        }, 10000);
    }


    /**
     * Initialize BLE for connection.
     */
    async initialize(): Promise<void> 
    {
        if (this.initialized) return

        await BleClient.initialize({ androidNeverForLocation: true })
        this.initialized = true
    }


    /**
     * Send access request to the ESP.
     * @param request The type of request to be sent.
     * @returns The acces response received from the server.
     */
    async sendAccessRequest(request: AccessRequest): Promise<AccessResponse> 
    {
        if (!this.device) 
            throw new Error("Nu există o conexiune BLE activă.")

        return new Promise( async (resolve, reject) => 
        {
            const timeout = setTimeout( () => 
            {
                reject(new Error("Timeout: ESP32 nu a răspuns în timp util."))
            }, 5000)

            await BleClient.startNotifications(
                this.device!.deviceId,
                SERVICE_UUID,
                NOTIFY_CHAR_UUID,

                (value) => 
                {
                    clearTimeout(timeout)

                    try {
                        const response: AccessResponse = JSON.parse(dataViewToText(value))
                        resolve(response)
                    } 
                    catch {
                        reject(new Error("Răspuns invalid de la ESP32."))
                    } 
                    finally {
                        BleClient.stopNotifications(
                            this.device!.deviceId,
                            SERVICE_UUID,
                            NOTIFY_CHAR_UUID
                        ).catch(() => {})
                    }
                }
            )

            try {
                const payload = JSON.stringify(request)
                await BleClient.write(
                    this.device!.deviceId,
                    SERVICE_UUID,
                    WRITE_CHAR_UUID,
                    textToDataView(payload)
                )
            } 
            catch (err) {
                clearTimeout(timeout)
                reject(new Error("Eroare la trimiterea codului BLE."))
            }
        })
    }


    /**
     * Try connecting to the ESP without showing the user a dialog. This requres the ESP"s device ID
     * to have been previously saved. If it has not been saved connection will fail.
     * @returns `true` if the connection is successful, else `false`.
     */
    async connectSilent(): Promise<boolean> 
    {
        try {
            await this.initialize()
            
            const saved = await Preferences.get({ key: "ble_device_id" })

            if (!saved.value) return false

            await BleClient.connect(saved.value, () => this.onDisconnect())
            this.device = { 
                deviceId: saved.value, 
                name: "ESP32" 
            }

            return true
        } 
        catch {
            return false
        }
    }


    /**
     * Try connecting to the ESP by showing a dialog to the user and having them select it. This will save
     * the ESP"s ID for automatic future connections.
     */
    async connectWithDialog(): Promise<void> 
    {
        await this.initialize()

        this.device = await BleClient.requestDevice({
            services: [SERVICE_UUID],
        })

        await Preferences.set({
            key: "ble_device_id",
            value: this.device.deviceId
        })

        await BleClient.connect(this.device.deviceId, () => this.onDisconnect());
    }


    /**
     * Disconnects the device from the ESP.
     */
    async disconnect(): Promise<void> 
    {
        if (!this.device) return

        await BleClient.disconnect(this.device.deviceId)
        this.device = null
    }


    /**
     * Checks if BLE is available on the system.
     */
    async isAvailable(): Promise<boolean> 
    {
        try {
            await this.initialize()

            const enabled = await BleClient.isEnabled()
            return enabled
        } 
        catch {
            return false
        }
    }


    /**
     * Checks of there is a BLE connection to the ESP.
     * @returns `true` if there is a connection, else `false`.
     */
    isConnected(): boolean 
    {
        return this.device !== null
    }


    /**
     * Handles disconnection from the ESP.
     */
    private onDisconnect(): void 
    {
        this.device = null
    }
}




export const bluetoothService = new BluetoothService();