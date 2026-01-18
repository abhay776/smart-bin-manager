export interface Item {
  id: string;
  name: string;
  category: string;
  subType?: string;
  quantity: number;
  expirationDate: string;
  location: string;
  barcode: string;
  binId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Bin {
  id: string;
  name: string;
  category: string;
  maxCapacity: number;
  currentQuantity: number;
  items: Item[];
}

export type Category = string;

// Default categories for Robotics Club
export const DEFAULT_CATEGORIES: string[] = [
  'Electronics',
  'Motors',
  'Sensors',
  'Mechanical Parts',
  'Tools',
  'Raw Materials',
  'Batteries',
  'Microcontrollers',
  'Other',
];

// Sub-types for specific categories
export const CATEGORY_SUBTYPES: Record<string, string[]> = {
  'Electronics': ['Resistors', 'Capacitors', 'ICs', 'LEDs', 'Transistors', 'Diodes', 'Connectors', 'Wires', 'PCBs', 'Other'],
  'Batteries': ['Li-Po', 'Li-Ion', '18650', 'AA', 'AAA', '9V', 'Lead Acid', 'NiMH', 'Coin Cell', 'Other'],
  'Microcontrollers': ['Arduino Uno', 'Arduino Nano', 'Arduino Mega', 'ESP32', 'ESP8266', 'Raspberry Pi Pico', 'STM32', 'ATtiny', 'Teensy', 'Other'],
  'Motors': ['DC Motors', 'Servo Motors', 'Stepper Motors', 'Brushless DC', 'Geared Motors', 'Linear Actuators', 'Other'],
  'Sensors': ['Ultrasonic', 'IR Sensors', 'Temperature', 'Humidity', 'Pressure', 'Accelerometer', 'Gyroscope', 'Light Sensors', 'Color Sensors', 'Other'],
  'Mechanical Parts': ['Gears', 'Bearings', 'Shafts', 'Pulleys', 'Belts', 'Wheels', 'Chassis', 'Screws/Bolts', 'Nuts', 'Other'],
  'Tools': ['Soldering', 'Cutting', 'Measuring', 'Hand Tools', 'Power Tools', 'Safety Equipment', 'Other'],
  'Raw Materials': ['Aluminum', 'Steel', 'Plastic', 'Wood', 'Acrylic', 'Carbon Fiber', '3D Printing Filament', 'Other'],
};

export interface Alert {
  id: string;
  type: 'low-stock' | 'expiring' | 'expired';
  itemId: string;
  itemName: string;
  message: string;
  severity: 'warning' | 'critical';
  createdAt: string;
}

export interface DashboardStats {
  totalItems: number;
  totalBins: number;
  lowStockCount: number;
  expiringCount: number;
  categoryBreakdown: Record<string, number>;
}
