                                                            /* *************************************************************************
                                                             
                                                                                 Code developed by Miguel Ángel Caño.
                                                                                     In order to program Xbee-M2M Routers.
                                                             ************************************************************************ */
                                                             
//Libraries included
#include <WaspXBeeZB.h>
#include "Wasp3G.h"
#include <WaspFrame.h>

//Variable declaration
int answer;
char * url= "*********";
int debug=1;

void setup()
{  
  // init USB port
  USB.ON();
  //////////////////////////
  // 1. init XBee
  //////////////////////////
  xbeeZB.ON();
  delay(3000);  
  //////////////////////////
  // 2. check XBee's network parameters
  //////////////////////////
  if(debug==1)
    checkNetworkParams();  
    // activates the 3G module:
    answer = _3G.ON();
      if ((answer == 1) || (answer == -3))
      { 
        if(debug==1){
          USB.println(F("3G module ready..."));
          // 2. set pin code:
          USB.println(F("Setting PIN code..."));
        }
      // **** must be substituted by the SIM code
      if (_3G.setPIN("4267") == 1) 
      {
        if(debug==1){
          USB.println(F("PIN code accepted"));
        }
      }
      else
      {
        if(debug==1){
          USB.println(F("PIN code incorrect"));
        }
      }  
      // 3. wait for connection to the network:
      answer = _3G.check(180);    
      if (answer == 1)
      {
        if(debug==1){
          USB.println(F("3G module connected to the network..."));
        }
      }      
      else
      {
        if(debug==1){
          USB.println(F("3G module cannot connect to the network..."));
        }
      }
    }
  else
  {
    if(debug==1){
      USB.println(F("3G module not started"));
    }
  }
}
void loop()
{ 
//////////////////////////
// 3. receive packets 
//////////////////////////
    if(_3G.check(60) == 0){
      // activates the 3G module:
      answer = _3G.ON();
      if ((answer == 1) || (answer == -3))
      { 
        if(debug==1){
          USB.println(F("3G module ready..."));
          // 2. set pin code:
          USB.println(F("Setting PIN code..."));
        }
        // **** must be substituted by the SIM code
        if (_3G.setPIN("4267") == 1) 
        {
          if(debug==1){
            USB.println(F("PIN code accepted"));
          }
        }
        else
        {
          if(debug==1){
            USB.println(F("PIN code incorrect"));
          }
        }  
        // 3. wait for connection to the network:
        answer = _3G.check(180);    
        if (answer == 1)
        {
          if(debug==1){
            USB.println(F("3G module connected to the network..."));
          }
        }      
        else
        {
          if(debug==1){
            USB.println(F("3G module cannot connect to the network..."));
          }
        }
    }
    else
    {
      if(debug==1){
        USB.println(F("3G module not started"));
      }
    }
  }
  else{
    // check available data in RX buffer
    if( xbeeZB.available()>0 ) 
    {
      // read a packet when XBee has noticed it to us
      xbeeZB.treatData(); 
      // check RX flag after 'treatData'
      if( !xbeeZB.error_RX ) 
      {
        // read available packets
        while( xbeeZB.pos>0 )
        {
          USB.print(F("Battery Level: "));
          USB.print(PWR.getBatteryLevel(),DEC);
          USB.println(F(" %"));
          queryParser();
          //free memory
          free(xbeeZB.packet_finished[xbeeZB.pos-1]); 
          //free pointer
          xbeeZB.packet_finished[xbeeZB.pos-1]=NULL; 
          //Decrement the received packet counter
          xbeeZB.pos--; 
        }
      }
    }
  }
}

                                    /******************************************* CORE FUNCTIONS *******************************************/

void queryParser()
{
      if(debug==1){
        USB.println(F("Connecting to the server..."));
        // compose the POST body
        // 5. get URL from the solicited URL
        USB.println(xbeeZB.packet_finished[xbeeZB.pos-1]->data);
      }
      answer = _3G.sendHTTPframe(url, 80, (uint8_t*) xbeeZB.packet_finished[xbeeZB.pos-1]->data, xbeeZB.packet_finished[xbeeZB.pos-1]->data_length, POST);
      if ( answer == 1)
      {
        if(debug==1){
          USB.println(F("Done"));  
          USB.println(F("**********************--------SERVER RESPONSE--------********************"));
          USB.println(_3G.buffer_3G);
        }
      }
      else if (answer < -14)
      {
        if(debug==1){
          USB.print(F("Failed. Error code: "));
          USB.println(answer, DEC);
          USB.print(F("CME error code: "));
          USB.println(_3G.CME_CMS_code, DEC);
        }
      }
      else 
      {
        if(debug==1){
          USB.print(F("Failed. Error code: "));
          USB.println(answer, DEC);
        } 
      }
}

                                    /******************************************* DEBUG FUNCTIONS *******************************************


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

  USB.println(F("\nJoined an XBee network!"));

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
