/* *************************************************************************
 
 August 2014.
 Code developed by Miguel Ángel Caño.
 In order to use with Libelium Waspmote Plug & Sense Smart Environment.
 ************************************************************************ */
/* CORE */

// Includes of the Sensor Board and Communications modules used
#include <WaspSensorGas_v20.h>
#include <WaspFrame.h>
#include <WaspXBeeZB.h>

//Variables declaration
/*
char  CONNECTOR_A[16] = "AIR_POLLUTANTS2";      
char  CONNECTOR_B[9] = "not used";    
char  CONNECTOR_C[4] = "CO2";
char  CONNECTOR_D[4] = "NO2";
char  CONNECTOR_E[3] = "O3";
char  CONNECTOR_F[16] = "AIR_POLLUTANTS1";
*/
//Frame ID
long  sequenceNumber = 0;                
//Stores data read from sensors
//Format: Volts
float connectorAFloatValue; 
float connectorCFloatValue;    
float connectorDFloatValue;   
float connectorEFloatValue;
float connectorFFloatValue;
//Format: Ohms
float connectorAresistance;
float connectorCresistance;
float connectorDresistance;
float connectorEresistance;
float connectorFresistance;

float RL_AP2 = 20;
float RL_NO2 = 3.5; //
float Ro_NO2 = 2.2; //
float RL_CO2 = 80; //80
float Ro_CO2 = 2.2;//
float RL_O3 = 20;
float Ro_O3 = 11;
float R100 = 1;
float RL_AP1 = 20; //7.5
int TIMES_TO_READ = 25;
float GAIN_CO2 = 5;
float GAIN_AP2 = 1;
float GAIN_NO2 = 1.1;
float GAIN_O3 = 1;
float GAIN_AP1 = 1.5; //4
//MAC destination (ROUTER in this case) -> Change in case you use another device to store data
char* macAddress="0013A20040B5B308"; 

//XBee packet declaration
packetXBee* packet;

//Counter used to indicate more than 10 loops
int counter=0; //Check initial frames sending
int counter2=0; //To avoid low level problems due to long periods of iterations

void setup()
{ 
  // Init USB port
  USB.ON();
  // 1. init XBee
  //////////////////////////
  xbeeZB.ON();  
  delay(3000);
  checkNetworkParams(); 
}

void loop()
{ 
connectorCFloatValue = 0;
connectorDFloatValue = 0;
connectorEFloatValue = 0;
connectorFFloatValue = 0;

 //Turn on the sensor board
  SensorGasv20.ON();   
  //Turn on the RTC
  RTC.ON();
  //supply stabilization delay
  delay(100);  
  // Turn on the sensors
  USB.println(F("Warming sensors. It takes about 90 seconds"));
  //Turning on TGS2602-AP2 sensor
  SensorGasv20.setSensorMode(SENS_ON, SENS_SOCKET3A);
  SensorGasv20.configureSensor(SENS_SOCKET3A, GAIN_AP2, RL_AP2);
  //turn on the CO2 sensor 
  SensorGasv20.configureSensor(SENS_CO2, GAIN_CO2); 
  SensorGasv20.setSensorMode(SENS_ON, SENS_CO2); 
  //Turning on NO2 Sensor
  SensorGasv20.configureSensor(SENS_SOCKET3B, GAIN_NO2, RL_NO2);
  SensorGasv20.setSensorMode(SENS_ON, SENS_SOCKET3B);    
  //Turning on and configuring O3 Sensor
  SensorGasv20.configureSensor(SENS_SOCKET2B, GAIN_O3, RL_O3);
  SensorGasv20.setSensorMode(SENS_ON, SENS_SOCKET2B);
  //Turning on and configuring TGS2611-AP1 sensor
  SensorGasv20.setSensorMode(SENS_ON, SENS_SOCKET4A);
  SensorGasv20.configureSensor(SENS_SOCKET4A, GAIN_AP1, RL_AP1);
  
  delay(90000);

  //Reading AP2 sensor
  connectorAFloatValue = getandmean(SENS_SOCKET3A);    

  //Reading CO2 sensor
  connectorCFloatValue = getandmean(SENS_CO2);  

  //Reading NO2 sensor
  connectorDFloatValue = getandmean(SENS_SOCKET3B);    

  //Reading O3 sensor
  connectorEFloatValue = getandmean(SENS_SOCKET2B);    

  //Reading AP1 sensor
  connectorFFloatValue = getandmean(SENS_SOCKET4A);    

  // Turn off the sensors

  SensorGasv20.setSensorMode(SENS_OFF, SENS_SOCKET3A);

  SensorGasv20.setSensorMode(SENS_OFF, SENS_CO2);

  SensorGasv20.setSensorMode(SENS_OFF, SENS_SOCKET3B);

  SensorGasv20.setSensorMode(SENS_OFF, SENS_SOCKET2B);

  SensorGasv20.setSensorMode(SENS_OFF, SENS_SOCKET4A);

  //Frame composition
  frame.createFrame(ASCII,"Gas");
  frame.addSensor(SENSOR_BAT, batterymean(SENSOR_BAT));
  frame.addSensor(SENSOR_AP2, AP2toppm(connectorAFloatValue));
  frame.addSensor(SENSOR_CO2, CO2toppm(connectorCFloatValue));
  frame.addSensor(SENSOR_NO2, NO2toppm(connectorDFloatValue));
  frame.addSensor(SENSOR_O3, O3toppm(connectorEFloatValue));
  frame.addSensor(SENSOR_AP1, AP1toppm(connectorFFloatValue));
  frame.showFrame();

  packet=(packetXBee*) calloc(1,sizeof(packetXBee)); // Memory allocation
  packet->mode=UNICAST; // Choose transmission mode: UNICAST or BROADCAST 

  xbeeZB.setDestinationParams( packet, macAddress, frame.buffer, frame.length);  

  xbeeZB.sendXBee(packet);

  if( xbeeZB.error_TX == 0) 
  {
    USB.println(F("Successful transmission"));
  }
  else 
  {
    USB.println(F("Transmission failure"));
  }

  free(packet);
  packet=NULL;

  //Sleep mode

  //Less time for the first time to check the correct working 
  counter++;
  if(counter<=10)
  { 
    Utils.blinkLEDs(300);  //Led indicates rebooting process
  }
  else
  {
    counter = 0;
    PWR.deepSleep("00:01:00:00",RTC_OFFSET,RTC_ALM1_MODE1,ALL_OFF);
    delay(5000);
    Utils.blinkLEDs(300); //going to sleep
  }
  //Avoiding micro problems (buffers overflow, etc...)
  counter2++;
  if(counter2>3000)
  {
    counter2 = 0;
    PWR.reboot();
  }
}


/* ADDITIONAL FUNCTIONS */

/*******************************************
 *
 *  checkNetworkParams - Check operating
 *  network parameters in the XBee module
 *
 *******************************************/
void checkNetworkParams()
{
  // 1. get operating 64-b PAN ID
  xbeeZB.getOperating64PAN();

  // 2. wait for association indication
  xbeeZB.getAssociationIndication();

  while( xbeeZB.associationIndication != 0 )
  { 
    delay(2000);

    // get operating 64-b PAN ID
    xbeeZB.getOperating64PAN();

    USB.print(F("operating 64-b PAN ID: "));
    USB.printHex(xbeeZB.operating64PAN[0]);
    USB.printHex(xbeeZB.operating64PAN[1]);
    USB.printHex(xbeeZB.operating64PAN[2]);
    USB.printHex(xbeeZB.operating64PAN[3]);
    USB.printHex(xbeeZB.operating64PAN[4]);
    USB.printHex(xbeeZB.operating64PAN[5]);
    USB.printHex(xbeeZB.operating64PAN[6]);
    USB.printHex(xbeeZB.operating64PAN[7]);
    USB.println();     

    xbeeZB.getAssociationIndication();
  }

  USB.println(F("\nJoined a network!"));

  // 3. get network parameters 
  xbeeZB.getOperating16PAN();
  xbeeZB.getOperating64PAN();
  xbeeZB.getChannel();

  USB.print(F("operating 16-b PAN ID: "));
  USB.printHex(xbeeZB.operating16PAN[0]);
  USB.printHex(xbeeZB.operating16PAN[1]);
  USB.println();

  USB.print(F("operating 64-b PAN ID: "));
  USB.printHex(xbeeZB.operating64PAN[0]);
  USB.printHex(xbeeZB.operating64PAN[1]);
  USB.printHex(xbeeZB.operating64PAN[2]);
  USB.printHex(xbeeZB.operating64PAN[3]);
  USB.printHex(xbeeZB.operating64PAN[4]);
  USB.printHex(xbeeZB.operating64PAN[5]);
  USB.printHex(xbeeZB.operating64PAN[6]);
  USB.printHex(xbeeZB.operating64PAN[7]);
  USB.println();

  USB.print(F("channel: "));
  USB.printHex(xbeeZB.channel);
  USB.println();

}

/*******************************************
 *
 This function measures from sensors and calculate 
 an average between 10 measurements. Parameter: SENSOR_TAG
 *
 *******************************************/

float getandmean(uint16_t SENS)
{  
  
  float measurement[TIMES_TO_READ];
  // Get 10 measurements
  for (int i=0;i<TIMES_TO_READ;i++)
  {
    measurement[i] = SensorGasv20.readValue(SENS);
    delay(100);
  }
  // Calculate average (stored in first position of array)
  for (int i=1; i<TIMES_TO_READ; i++) 
  {
    // Add the next element to the total
    measurement[0] += measurement[i];
  }
  measurement[0] = measurement[0]/TIMES_TO_READ; 
  return measurement[0];
}

float batterymean(uint16_t SENS_BATTERY)
{   
  //This function measures from battery sensor and calculate an average between 10 measurements. Parameter: SENSOR_BAT
  float measurement[10];
  // Get 10 measurements
  for (int i=0;i<10;i++)
  {
    measurement[i] = PWR.getBatteryLevel();
  }

  // Calculate average (stored in first position of array)
  for (int i=1; i<10; i++) 
  {
    // Add the next element to the total
    measurement[0] += measurement[i];
  }
  measurement[0] = measurement[0]/10; 
  return measurement[0];
}

float AP2toppm(float connectorAP2FloatValue)
{
  //----To read sensor voltage and convert into ppm ----
  // INTRODUCE IN THE NEXT ARRAY THE CONCENTRATION VALUES
  int coCalibrationConcentration[3] = {
    1,10,30  };
  // INTRODUCE IN THE NEXT ARRAY THE CALIBRATION OUTPUT OF THE SENSORS
  //Ro=20Kohm
  float coCalibrationOutput[3] = {3.8366 , 2.5335 , 1.6074};
  float ap2Val=0;
  ap2Val = SensorGasv20.calculateResistance(SENS_SOCKET3A, connectorAP2FloatValue, GAIN_AP2, RL_AP2);
  ap2Val = SensorGasv20.calculateConcentration(coCalibrationConcentration,coCalibrationOutput,ap2Val);
  return ap2Val;
}
float NO2toppm(float connectorNO2FloatValue)
{
  //----To read sensor voltage and convert into ppm ----
  // Rs/Ro=RL*Vs/((Vcc-Vs)*Ro) for NO2; 
  float Rs;
  float NO2_value;
  //Rs = SensorGasv20.calculateResistance(SENS_SOCKET3B, connectorNO2FloatValue, GAIN_AP2, RL_AP2)*Ro_NO2;
  ///USB.println(Rs);
  Rs = RL_NO2*connectorNO2FloatValue/((1.8-connectorNO2FloatValue)*Ro_NO2); 
  NO2_value = pow(10, (log10(Rs)-2.176)/(-1.737))/1000;
  return NO2_value;
}

float CO2toppm(float connectorCO2FloatValue)
{
  //----To read sensor voltage and convert into ppm ----
  float CO2_value;
  //CO2_value = 1000*(connectorCO2FloatValue/GAIN_CO2);
  CO2_value = pow(10, (((0.355*GAIN_CO2 - connectorCO2FloatValue/GAIN_CO2) + 158.631)/62.877));   
  return CO2_value;     
}

float O3toppm(float connectorO3FloatValue)
{
  int coCalibrationConcentration[3] = {60,100,400};

  // INTRODUCE IN THE NEXT ARRAY THE CALIBRATION OUTPUT OF THE SENSORS
  //Ro=20Kohm
  float coCalibrationOutput[3] = {99.525, 200, 200000};
  float val=0;
  val = SensorGasv20.calculateResistance(SENS_SOCKET2B, connectorO3FloatValue, GAIN_O3, RL_O3);
  val = SensorGasv20.calculateConcentration(coCalibrationConcentration,coCalibrationOutput,val);
  return val/1000; 
  //----To read sensor voltage and convert into ppm ----
  //float Rs;
  //float O3_value;
  //Rs = RL_O3*connectorO3FloatValue/((2.5-connectorO3FloatValue)*Ro_O3);
  //O3_value = pow(10, (log10(Rs/R100)*100));
  //return O3_value;     
}
float AP1toppm(float connectorAP1FloatValue)
{
  //----To read sensor voltage and convert into ppm ----
  //INTRODUCE IN THE NEXT ARRAY THE CONCENTRATION VALUES
  int coCalibrationConcentration[3] = {1,10,30};
  // INTRODUCE IN THE NEXT ARRAY THE CALIBRATION OUTPUT OF THE SENSORS
  //Ro=20Kohm
  float coCalibrationOutput[3] = {0.7 , 0.4 , 0.15};
  float ap1Val=0;
  ap1Val = SensorGasv20.calculateResistance(SENS_SOCKET4A, connectorAP1FloatValue, GAIN_AP1, RL_AP1);
  ap1Val = SensorGasv20.calculateConcentration(coCalibrationConcentration,coCalibrationOutput,ap1Val);
  return ap1Val;
}

