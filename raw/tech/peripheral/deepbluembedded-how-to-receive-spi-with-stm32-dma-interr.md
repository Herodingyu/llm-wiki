> 来源: deepbluembedded.com
> 原URL: https://deepbluembedded.com/how-to-receive-spi-with-stm32-dma-interrupt/
> 收集时间: 2026-05-01

# How To Receive SPI Data With STM32 DMA / Interrupt / Polling Modes







How To Receive SPI Data With STM32 DMA / Interrupt / Polling Modes





































Skip to content












DeepBlue Menu
Home
Embedded Systems

Embedded Tutorials


STM32 ARM
ESP32
Arduino
Microchip PIC


Embedded Projects


STM32 Projects
Arduino Projects


Articles

Electronics

Electronics Tutorials
Electronics Projects

Resources

Shop
Courses
Calculators

Blog
About

Contact














STM32

ESP32

ARDUINO

PIC

Electronics




## How To Receive SPI Data With STM32 DMA / Interrupt / Polling Modes

by Khaled Magdy





Previous Tutorial
Tutorial 42
Next Tutorial

How To Receive SPI Data With STM32 (DMA-Interrupt-Polling) Modes

STM32 Course Home Page ????

In this tutorial, we&#8217;ll discuss how to and receive SPI data with STM32 microcontrollers in DMA, Interrupt, and Polling modes. Starting with the SPI Master (Transmitter) firmware project, then I&#8217;ll show you the test setup (SPI Master Board -&gt; SPI Slave Board) for the LABs we&#8217;ll be doing hereafter.

There are 3 LAB projects to be done in this tutorial to show you how to configure the STM32 SPI Peripheral in Slave mode and receive the incoming data in 3 different modes (polling-interrupt-DMA). Also note that: this tutorial doesn&#8217;t have a solution for the case of receiving unknown data length of SPI messages just like the previous UART tutorial. Some solutions to this case for both UART and SPI will be discussed in future tutorials.

In this tutorial: 3 LABs

LAB 55
STM32 SPI Slave Data Reception With Polling Mode

LAB 56
STM32 SPI Slave Data Reception With Interrupt Mode

LAB 57
STM32 SPI Slave Data Reception With DMA Mode

[toc]

##    Required Components For LABs

All the example code/LABs/projects in the course are going to be done using those boards below.

Nucleo32-L432KC (ARM Cortex-M4 @ 80MHz)   or (eBay)
Blue Pill STM32-F103 (ARM Cortex-M3 @ 72MHz)  or (eBay)
ST-Link v2 Debugger  or (eBay)

QTY
Component Name
???? Amazon.com
???? eBay.com

2
BreadBoard
Amazon
eBay

1
LEDs Kit
Amazon Amazon
eBay

1
Resistors Kit
Amazon Amazon
eBay

1
Capacitors Kit
Amazon Amazon
eBay &amp; eBay

2
Jumper Wires Pack
Amazon Amazon
eBay &amp; eBay

1
9v Battery or DC Power Supply
Amazon Amazon Amazon
eBay

1
Micro USB Cable
Amazon
eBay

2
Push Buttons
Amazon Amazon
eBay

1
USB-TTL Converter or FTDI Chip
Amazon Amazon
eBay  eBay

★ Check The Full Course Complete Kit List

Some Extremely Useful Test Equipment For Troubleshooting:

My Digital Storage Oscilloscope (DSO): Siglent SDS1104 (on Amazon.com)  (on eBay)
FeelTech DDS Function Generator: KKMoon FY6900 (on Amazon.com)  (on eBay)
Logic Analyzer (on Amazon.com)  (on eBay)

Affiliate Disclosure: When you click on links in this section and make a purchase, this can result in this site earning a commission. Affiliate programs and affiliations include, but are not limited to, the eBay Partner Network (EPN) and Amazon.com.

##   STM32 SPI Master Data Transmission

After configuring the SPI peripheral in master mode whether in CubeMX or by register-accessing, we can start transmitting data to slave SPI devices. There are some different schemes in order to achieve the data transmission over SPI bus and here are a few of them.

## 1- SPI Transmitter With Polling

The first method for sending a data buffer over the SPI bus is by using the Polling method which is a blocking piece of code that waits for the current byte to be completely transmitted then it sends the next and so on.

This method is the easiest to implement and the most time-consuming for the CPU which will end up being in the &#8220;busy waiting&#8221; state for some time unnecessarily.

Here is an example code for sending a data buffer over SPI in the blocking mode (polling)











1234

uint8_t TX_Data[] = "Hello World!";.. HAL_SPI_Transmit(&amp;hspi1, TX_Data, sizeof(TX_Data), 1);..





## 2- SPI Transmitter With Interrupt

Next, we can use the interrupt signal to free-up some of the CPU time. So it does start the data transmission process and goes to handle other logic parts of the firmware until the transmission completion interrupt signal is fired. Then, the CPU goes to handle the interrupt and sends the next byte of data to be transmitted. And so on!

This way is more efficient than polling the peripheral indeed. However, in some “Time Critical” applications we need everything to be as deterministic, in time, as possible. And a major problem with interrupts is that we can’t expect when it’d arrive or during which task. That can potentially screw up the timing behavior of the system, Especially with an extremely fast communication bus like SPI that can definitely block the CPU if you’re receiving massive data blocks at a very high rate.

Here is an example code for sending a data buffer over SPI in the interrupt mode










123456789101112131415161718

SPI_HandleTypeDef hspi1;&nbsp;uint8_t TX_Data[] = "Hello World!";&nbsp;int main(void){&nbsp;&nbsp;&nbsp;&nbsp;..&nbsp;&nbsp;&nbsp;&nbsp;HAL_SPI_Transmit_IT(&amp;hspi1, TX_Data, sizeof(TX_Data));&nbsp;&nbsp;&nbsp;&nbsp;..&nbsp;&nbsp;&nbsp;&nbsp;while (1)&nbsp;&nbsp;&nbsp;&nbsp;{&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;..&nbsp;&nbsp;&nbsp;&nbsp;}}void HAL_SPI_TxCpltCallback(SPI_HandleTypeDef * hspi){&nbsp;&nbsp;&nbsp;&nbsp;// TX Done .. Do Something ...}





## 3- SPI Transmitter With DMA

Using the DMA unit not only will make the SPI going at full speed on both sides of communication, but it will also free the CPU from doing the data transfers “from memory to peripheral”. This will end up saving a lot of time and is considered to be the most efficient way to handle this peripheral to memory data transfer and vice versa.

## 4- SPI Transmitter With Timer Interrupt (Periodic)

Another way to send serial data is to use a periodic timer interrupt and send the data buffer elements one by one each timer overflow period. That can be configured by the programmer to speed up or slow down the data transmission rate which is another parameter other than the bitrate (baud rate) for the hardware of SPI itself.

This technique is common for low-speed communication if you&#8217;re sending readings (data) maybe 1000 times per second or something like that. For example, you&#8217;re sending some data to an external SPI DAC chip, the sampling rate can be a few kHz. So, it&#8217;d be ideal to use this technique and set up the timer in such a way that achieves the timing you want for the sample period.

Note that this method involves CPU work to service the interrupt signal on-time and access the memory to read the data and send it over SPI. For 10k times or 40k times per second which turns out to be time-consuming and a better way does exist for such a situation as shown next.

## 5- SPI Transmitter With Timer + DMA (Periodic)

This method is similar to the previous one except it doesn&#8217;t need any CPU intervention at all. The DMA unit is responsible for data transfer operations and it gets triggered on-time by the timer overflow signal. You can change the timer period anytime during the code runtime and achieve any sampling rate you want.

This technique has been discussed and implemented in a previous tutorial that you can check out.

##   STM32 SPI TX-RX Test Setup

## Test Setup Overview

Here is the test setup we&#8217;ll be using for today&#8217;s 3 LABs. The SPI Master (Transmitter) is going to be STM32F103C8T6 and another one will be acting as an SPI Slave (Receiver). The data to be Sent/Received is going to be a &#8220;Sine Table&#8221; in string format.

The SPI Master will send the table elements one by one until completion. The SPI Slave will receive that incoming data byte by byte and print them over through a UART port to the PC. And we&#8217;ll open a serial plotter at the PC to see the incoming data that should be a complete cycle sine waveform.

As you can see in the diagram above, there will be 2 STM32 SPI devices connected together. The first one is a Master SPI that will send out a buffer of data &#8220;Sine Table&#8221;. The other device is an SPI Slave that will receive the incoming SPI data and send it out over the UART port to a PC. The slave device will receive the SPI data using (Polling, interrupt, DMA) and send it out after the reception.

However, on the slave side, you can direct the incoming data from SPI to UART using DMA or maybe with polling or interrupt as well. In this case, you can use a short buffer and send the data out over UART will you&#8217;re receiving them through SPI. Any implementation will still get the task done.

## Sine Table Data Buffer

You can use a MATLAB script to generate the sine table data points or use this Online Sine Lookup Table Generator Tool. I want the maximum value to be 255, will generate 256 data points for the complete cycle, make numbers in the decimal format, and will get them printed in a single line to be easier for the next processing.

Copy the text that has been generated to any word processor like LibreOffice. And there you&#8217;ll need to click edit and choose the &#8220;Find and Replace&#8221; tool. Then replace every comma &#8220;,&#8221; with a &#8220;\r\n&#8221; so that we can easily plot that data when it&#8217;s received at the PC side.

We&#8217;ll be using &#8220;Arduino Serial Plotter&#8221; to plot those points when the slave has successfully received the data and transmitted it back over the UART port.

The total string length is now 1652 bytes. This is going to be a global variable at the SPI master device, so it&#8217;s going to take up a lot of the flash memory when it&#8217;s flashing and the data buffer will be initialized in RAM during startup. That&#8217;s a lot of memory indeed but anyway it&#8217;s a tester code. We want to test the receiver functionality and not really concerned about the master device.

##   STM32 SPI Master (TX) Project

Step1: Open CubeMX &amp; Create New Project

Step2: Choose The Target MCU &amp; Double-Click Its Name

STM32F103C8T6 (the one I&#8217;ll be using) or any other STM32 part you&#8217;ve got

Step3: Go To The RCC Clock Configuration

Step4: Set The System Clock To Be 70MHz or whatever your uC board supports

And set the APB2 bus clock Prescaler to 16 or whatever value that makes the SPI bit rate a little bit lower than the UART baud rate just to give the slave SPI devices enough headroom to be able to send out the data packets they will receive.

Step5: Enable The SPI Module (Transmitter Only Master Mode)

Just remember the settings for this transmitter SPI device because you&#8217;ll have to have similar settings for the slave device as well. The clock edge, polarity, and data size and order. The clock rate is only important for the master device. The SPI slave clock rate value is neglected.

Step6: Generate The Initialization Code &amp; Open The Project In Your IDE

Now, we can start developing our application in the main.c source file.

Here is The Application Code For The SPI Master Device (main.c)










1234567891011121314151617181920212223242526

#include "main.h"&nbsp;SPI_HandleTypeDef hspi1;&nbsp;uint8_t TX_Data[] = "128\r\n131\r\n134\r\n137\r\n140\r\n143\r\n146\r\n149\r\n152\r\n155\r\n158\r\n162\r\n165\r\n167\r\n170\r\n173\r\n176\r\n179\r\n182\r\n185\r\n188\r\n190\r\n193\r\n196\r\n198\r\n201\r\n203\r\n206\r\n208\r\n211\r\n213\r\n215\r\n218\r\n220\r\n222\r\n224\r\n226\r\n228\r\n230\r\n232\r\n234\r\n235\r\n237\r\n238\r\n240\r\n241\r\n243\r\n244\r\n245\r\n246\r\n248\r\n249\r\n250\r\n250\r\n251\r\n252\r\n253\r\n253\r\n254\r\n254\r\n254\r\n255\r\n255\r\n255\r\n255\r\n255\r\n255\r\n255\r\n254\r\n254\r\n254\r\n253\r\n253\r\n252\r\n251\r\n250\r\n250\r\n249\r\n248\r\n246\r\n245\r\n244\r\n243\r\n241\r\n240\r\n238\r\n237\r\n235\r\n234\r\n232\r\n230\r\n228\r\n226\r\n224\r\n222\r\n220\r\n218\r\n215\r\n213\r\n211\r\n208\r\n206\r\n203\r\n201\r\n198\r\n196\r\n193\r\n190\r\n188\r\n185\r\n182\r\n179\r\n176\r\n173\r\n170\r\n167\r\n165\r\n162\r\n158\r\n155\r\n152\r\n149\r\n146\r\n143\r\n140\r\n137\r\n134\r\n131\r\n128\r\n124\r\n121\r\n118\r\n115\r\n112\r\n109\r\n106\r\n103\r\n100\r\n97\r\n93\r\n90\r\n88\r\n85\r\n82\r\n79\r\n76\r\n73\r\n70\r\n67\r\n65\r\n62\r\n59\r\n57\r\n54\r\n52\r\n49\r\n47\r\n44\r\n42\r\n40\r\n37\r\n35\r\n33\r\n31\r\n29\r\n27\r\n25\r\n23\r\n21\r\n20\r\n18\r\n17\r\n15\r\n14\r\n12\r\n11\r\n10\r\n9\r\n7\r\n6\r\n5\r\n5\r\n4\r\n3\r\n2\r\n2\r\n1\r\n1\r\n1\r\n0\r\n0\r\n0\r\n0\r\n0\r\n0\r\n0\r\n1\r\n1\r\n1\r\n2\r\n2\r\n3\r\n4\r\n5\r\n5\r\n6\r\n7\r\n9\r\n10\r\n11\r\n12\r\n14\r\n15\r\n17\r\n18\r\n20\r\n21\r\n23\r\n25\r\n27\r\n29\r\n31\r\n33\r\n35\r\n37\r\n40\r\n42\r\n44\r\n47\r\n49\r\n52\r\n54\r\n57\r\n59\r\n62\r\n65\r\n67\r\n70\r\n73\r\n76\r\n79\r\n82\r\n85\r\n88\r\n90\r\n93\r\n97\r\n100\r\n103\r\n106\r\n109\r\n112\r\n115\r\n118\r\n121\r\n124\r\n";&nbsp;void SystemClock_Config(void);static void MX_GPIO_Init(void);static void MX_SPI1_Init(void);&nbsp;int main(void){&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;HAL_Init();&nbsp;&nbsp;&nbsp;&nbsp;SystemClock_Config();&nbsp;&nbsp;&nbsp;&nbsp;MX_GPIO_Init();&nbsp;&nbsp;&nbsp;&nbsp;MX_SPI1_Init();&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// Send The TX Data Buffer (Blocking Mode)&nbsp;&nbsp;&nbsp;&nbsp;HAL_SPI_Transmit(&amp;hspi1, TX_Data, sizeof(TX_Data), 5000);&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;while (1)&nbsp;&nbsp;&nbsp;&nbsp;{&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}}





Download The STM32 SPI Master Transmitter (Blocking)

Compile the project and flash the code to the SPI Master device board. And now, we&#8217;ll get ready to do the SPI receiver projects (in 3 modes).

##  STM32 SPI Slave Receiver Polling Mode &#8211; LAB

LAB Number
55

LAB Title
STM32 SPI Slave Data Reception With Polling Mode

Step1: Open CubeMX &amp; Create New Project

Step2: Choose The Target MCU &amp; Double-Click Its Name

STM32F103C8T6 (the one I&#8217;ll be using) or any other STM32 part you&#8217;ve got

Step3: Go To The RCC Clock Configuration

Step4: Set The System Clock To Be 70MHz or whatever your uC board supports

Step5: Enable The SPI Module (Receiver Only Slave Mode)

Step6: Enable Any UART Module (Async Mode) @ 115200 bps

Step7: Generate The Initialization Code &amp; Open The Project In Your IDE

Now, we can start developing our application in the main.c source file.

At this point, we can pretend as if we don&#8217;t know that incoming SPI data length from the master device and we&#8217;d make the receiver buffer large enough to get all the incoming data bytes and set the timeout to any reasonable value after which we&#8217;ll stop SPI reception and start processing the available data, if any, has been received.

Otherwise, we can just make a buffer with the same size as the incoming string. In the next 2 LABs, we&#8217;ll see another way to do this assuming data length is unknown.

Here is The Application Code For This LAB (main.c)










1234567891011121314151617181920212223242526272829

#include "main.h"&nbsp;SPI_HandleTypeDef hspi1;UART_HandleTypeDef huart1;&nbsp;uint8_t RX_Data[1652] = {0};&nbsp;void SystemClock_Config(void);static void MX_GPIO_Init(void);static void MX_SPI1_Init(void);static void MX_USART1_UART_Init(void);&nbsp;int main(void){&nbsp;&nbsp;&nbsp;&nbsp;HAL_Init();&nbsp;&nbsp;&nbsp;&nbsp;SystemClock_Config();&nbsp;&nbsp;&nbsp;&nbsp;MX_GPIO_Init();&nbsp;&nbsp;&nbsp;&nbsp;MX_SPI1_Init();&nbsp;&nbsp;&nbsp;&nbsp;MX_USART1_UART_Init();&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// Receive SPI Data (Blocking Mode) Polling&nbsp;&nbsp;&nbsp;&nbsp;HAL_SPI_Receive(&amp;hspi1, RX_Data, sizeof(RX_Data), 5000);&nbsp;&nbsp;&nbsp;&nbsp;HAL_UART_Transmit(&amp;huart1, RX_Data, sizeof(RX_Data), 5000);&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;while (1)&nbsp;&nbsp;&nbsp;&nbsp;{&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}}





Download The STM32 SPI Slave Receiver (Polling) &#8211; LAB55

The Result For This LAB Testing (Video)

I did restart the slave device first, then restart the transmitter and wait for the 1.6Kbytes to be completely received over SPI and sent over UART to my PC. The Arduino Serial Plotter did catch all the data bytes successfully and the result is a pretty sine wave.

Then, I did restart both devices again. The slave then the master shortly before the 5sec timeout is over. And the result was another sine wave cycle as you can see in the demo video down below.

##  STM32 SPI Slave Receiver Interrupt Mode &#8211; LAB

LAB Number
56

LAB Title
STM32 SPI Slave Data Reception With Interrupt Mode

Step1: Open CubeMX &amp; Create New Project

Step2: Choose The Target MCU &amp; Double-Click Its Name

STM32F103C8T6 (the one I&#8217;ll be using) or any other STM32 part you&#8217;ve got

Step3: Go To The RCC Clock Configuration

Step4: Set The System Clock To Be 70MHz or whatever your uC board supports

Step5: Enable The SPI Module (Receiver Only Slave Mode) + Enable NVIC Interrupt For SPI

Step6: Enable Any UART Module (Async Mode) @ 115200 bps + Enable UART Interrupt in NVIC tab

Step7: Generate The Initialization Code &amp; Open The Project In Your IDE

Now, we can start developing our application in the main.c source file.

At this point, we can pretend as if we don&#8217;t know the incoming SPI data length from the master device and we&#8217;d make the receiver buffer may be 100 bytes. Whenever 100 bytes are received by SPI in interrupt mode, the Rx completion callback function is called. At which, we&#8217;ll process the received data and repeat to get the next 100 bytes.

The issue with this approach is we&#8217;ll be receiving a total of 1652 bytes. After 16 callbacks we&#8217;ll have received and processed 1600 bytes of data. There will be 52 bytes remaining. The SPI will receive those bytes in interrupt mode. But the application will not be notified as the callback function gets called only when the provided buffer (100 bytes) is full.

Those remaining 52 bytes won&#8217;t be lost or anything. They&#8217;ll roll over to the next communication session. If we did restart the master device, it&#8217;ll attempt to send another 1652bytes data packet. After getting the first 48 bytes, the Rx callback will be called because there are already another 52 bytes in the buffer from the last communication session. So it&#8217;s ok!

In other applications, you may need to be notified when a complete message is received whatever its length is. And in this case, it should have a special termination like &#8220;\r\n&#8221; or anything like that. And this will be a topic for a dedicated article to address the common question of &#8220;receiving unknown data length over SPI or UART&#8221;.

Here is The Application Code For This LAB (main.c)










1234567891011121314151617181920212223242526272829303132333435

#include "main.h"&nbsp;#define BUFFER_SIZE 100&nbsp;SPI_HandleTypeDef hspi1;UART_HandleTypeDef huart1;&nbsp;uint8_t RX_Buffer[BUFFER_SIZE] = {0};&nbsp;void SystemClock_Config(void);static void MX_GPIO_Init(void);static void MX_SPI1_Init(void);static void MX_USART1_UART_Init(void);&nbsp;int main(void){&nbsp;&nbsp;&nbsp;&nbsp;HAL_Init();&nbsp;&nbsp;&nbsp;&nbsp;SystemClock_Config();&nbsp;&nbsp;&nbsp;&nbsp;MX_GPIO_Init();&nbsp;&nbsp;&nbsp;&nbsp;MX_SPI1_Init();&nbsp;&nbsp;&nbsp;&nbsp;MX_USART1_UART_Init();&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;HAL_SPI_Receive_IT(&amp;hspi1, RX_Buffer, BUFFER_SIZE);&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;while (1)&nbsp;&nbsp;&nbsp;&nbsp;{&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}}&nbsp;void HAL_SPI_RxCpltCallback(SPI_HandleTypeDef * hspi){&nbsp;&nbsp;&nbsp;&nbsp;HAL_SPI_Receive_IT(&amp;hspi1, RX_Buffer, BUFFER_SIZE);&nbsp;&nbsp;&nbsp;&nbsp;HAL_UART_Transmit_IT(&amp;huart1, RX_Buffer, BUFFER_SIZE);}





Download The STM32 SPI Slave Receiver (Interrupt) &#8211; LAB56

The Result For This LAB Testing (Video)

As you can see in the test demo video down below, we&#8217;ve successfully received the incoming data over SPI. And it has been sent to the PC over UART in batches of 100 bytes. The first 1600 was plotted on the monitor and we&#8217;re missing the last 52 bytes which have been shown as an in-complete sine wave cycle.

Then, I did restart the Master SPI device to attempt sending another packet of 1652 byte for the next cycle. And as you can see, the last 52 bytes were kept in the buffer. Otherwise, there should have been a glitch in the waveform. It&#8217;s easy to visually spot a communication error in this test setup because it&#8217;ll show up as a glitch in the sinusoidal waveform.
https://deepbluembedded.com/wp-content/uploads/2021/03/STM32-SPI-Slave-Receiver-Interrupt-Mode-LAB56.mp4

##  STM32 SPI Slave Receiver With DMA Mode &#8211; LAB

LAB Number
57

LAB Title
STM32 SPI Slave Data Reception With DMA Mode

Step1: Open CubeMX &amp; Create New Project

Step2: Choose The Target MCU &amp; Double-Click Its Name

STM32F103C8T6 (the one I&#8217;ll be using) or any other STM32 part you&#8217;ve got

Step3: Go To The RCC Clock Configuration

Step4: Set The System Clock To Be 70MHz or whatever your uC board supports

Step5: Enable The SPI Module (Receiver Only Slave Mode) + Enable DMA Channel For SPI With its NVIC Interrupt

Step6: Enable Any UART Module (Async Mode) @ 115200 bps + Enable UART Interrupt in NVIC tab

Step7: Generate The Initialization Code &amp; Open The Project In Your IDE

Now, we can start developing our application in the main.c source file.










1234567891011121314151617181920212223242526272829303132333435363738

#include "main.h"&nbsp;#define BUFFER_SIZE 100&nbsp;SPI_HandleTypeDef hspi1;DMA_HandleTypeDef hdma_spi1_rx;UART_HandleTypeDef huart1;&nbsp;uint8_t RX_Buffer[BUFFER_SIZE] = {0};&nbsp;void SystemClock_Config(void);static void MX_GPIO_Init(void);static void MX_DMA_Init(void);static void MX_SPI1_Init(void);static void MX_USART1_UART_Init(void);&nbsp;int main(void){&nbsp;&nbsp;&nbsp;&nbsp;HAL_Init();&nbsp;&nbsp;&nbsp;&nbsp;SystemClock_Config();&nbsp;&nbsp;&nbsp;&nbsp;MX_GPIO_Init();&nbsp;&nbsp;&nbsp;&nbsp;MX_DMA_Init();&nbsp;&nbsp;&nbsp;&nbsp;MX_SPI1_Init();&nbsp;&nbsp;&nbsp;&nbsp;MX_USART1_UART_Init();&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;HAL_SPI_Receive_DMA(&amp;hspi1, RX_Buffer, BUFFER_SIZE);&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;while (1)&nbsp;&nbsp;&nbsp;&nbsp;{&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}}&nbsp;void HAL_SPI_RxCpltCallback(SPI_HandleTypeDef * hspi){&nbsp;&nbsp;&nbsp;&nbsp;HAL_SPI_Receive_DMA(&amp;hspi1, RX_Buffer, BUFFER_SIZE);&nbsp;&nbsp;&nbsp;&nbsp;HAL_UART_Transmit_IT(&amp;huart1, RX_Buffer, BUFFER_SIZE);}





Download The STM32 SPI Slave Receiver (DMA) &#8211; LAB57

The Result For This LAB Testing (Video)

It did work exactly like the previous lab (interrupt mode)

##  Concluding Remarks

We&#8217;ve done SPI data transmission and reception in 3 different modes. And demonstrated the difference between all of them. Whether by creating a large-enough RX buffer given the number of bytes to be received or by acting as if we don&#8217;t know the length of the incoming data. Both ways did work just as fine.

What I&#8217;ve commonly seen in the comments here on my website and other places online is an issue that happens with a lot of programmers while receiving any incoming data with STM32 microcontrollers over SPI or UART with unknown data length. How to notify my application at the end of each message?

Like GNSS (GPS) strings and other string-based communications. How long should the RX buffer be and how to work around this issue?

Fortunately, the UART hardware in STM32 microcontrollers does provide a feature called IDLE line detection. That can potentially be used to report &#8220;end of communication session&#8221;. That would mean we&#8217;ve successfully received a complete message whatever its length. Is it the only way to solve this problem?

On the other hand, SPI doesn&#8217;t have such a feature.

All of that and more will be discussed in detail with some different solutions and techniques in a future tutorial or two for both UART and SPI.

I&#8217;d really like to read your thoughts about this topic and how would you solve this problem given that your application can&#8217;t process the data partially. If you could notice in my LABs, the data is easily processed partially and I didn&#8217;t need to wait for all the incoming 1652 bytes to be received as I can process them &#8220;in batches&#8221;. So this issue doesn&#8217;t arise in this category of applications.

Did you find this helpful? If yes, please consider supporting this work and sharing these tutorials!

Stay tuned for the upcoming tutorials and don&#8217;t forget to SHARE these tutorials. And consider SUPPORTING this work to keep publishing free content just like this!

Previous Tutorial
Tutorial 42
Next Tutorial


## Related

Share This Page With Your Network!



Join Our +25,000 Newsletter Subscribers!

Stay Updated With All New Content Releases. You Also Get Occasional FREE Coupon Codes For Courses &amp; Other Stuff!








Type your email…











Subscribe









Categories Embedded Systems, Embedded Tutorials, STM32 ARM

Tags STM32 Serial Communication


STM32 SPI Tutorial

STM32 MAX7219 Dot Matrix Display Interfacing Library



Author

Khaled Magdy

Embedded systems engineer with several years of experience in embedded software and hardware design. I work as an embedded SW engineer in the Automotive &amp; e-Mobility industry. However, I still do Hardware design and SW development for DSP, Control Systems, Robotics, AI/ML, and other fields I'm passionate about.

I love reading, writing, creating projects, and teaching. A reader by day and a writer by night, it's my lifestyle. I believe that the combination of brilliant minds, bold ideas, and a complete disregard for what is possible, can and will change the world! I will be there when it happens, will you?







## 1 thought on &ldquo;How To Receive SPI Data With STM32 DMA / Interrupt / Polling Modes&rdquo;








Andrea



January 15, 2023 at 10:51 PM








Thank you for your posts, very interesting.

I have two signal one is a clock about 12MHz and other is data which I need to sample at clock / 128.

Every byte is trasmitted with 10 bit.

Can I use spi module for this operation? I&#8217;d like use SPI for I can receive with DMA.

Another solution is sampling the digital pin when I have an overflow (128) on a timer which is clocked by clock signal.

With second solution microcontroller should always work, while with the first solution the microcontroller work only when there is an interrupt data is received from spi.
Reply






## Leave a Comment Cancel reply

CommentName
Email
Website

Notify me of new posts by email.



&#916;












Learn STM32 Basics

Setting Up STM32 Toolchain

Getting Started With STM32

STM32 HAL Library

GPIO Tutorial

GPIO Output (Write &amp; Toggle Pin)

GPIO Input (Read Pin)

STM32 RCC (Reset &amp; Clock)

STM32 delay_us (DWT + Timer)

STM32 delay_us (SysTick Timer)

Debugging With ST-Link v2

STM32 Serial Print Debugging

STM32 Interrupts Tutorial

External Interrupt Pins

STM32 Timers Tutorial

Timers: Timer Mode + Interrupt

Timers: Counter Mode

Timers: Input Capture ICU Mode

Timers: Encoder Mode

STM32 PWM Output Tutorial

PWM Frequency &amp; Resolution

STM32 PWM Input Mode

Complementary PWM &amp; Dead-Time

3-Phase PWM (Center-Aligned)

3-Phase PWM (Edge-Aligned)

PWM Phase Shift (Timer Sync)

PWM Break Input (Shutdown)

ECUAL Drivers Integration

STM32 DMA Tutorial

MATH Library (Functions)

STM32 EEPROM (FEE)

TSC (Touch Sensing Controller)

Potentiometers Reading

STM32 Low Power Modes

Analog Peripherals

STM32 ADC Tutorial

ADC: Single-Channel Single-Conv (Poll, Int, DMA)

ADC: Single-Channel Continuous-Conversion

ADC: Multi-Channel Single-Conv (Poll, DMA)

ADC: Multi-Channel Continuous-Conversion

ADC: Timer &amp; External Trigger Sources

ADC: Injected Channel Conversion Mode

ADC: Analog Watchdog Mode

ADC: Channel Select

STM32 DAC Tutorial

DAC: Generating Waveforms

DAC: PWM As a DAC

DAC: PWM+DMA+Timer (Wave Gen.)

STM32 OpAmp Tutorial

STM32 Comparator Tutorial

Serial Communication

STM32 UART Tutorial

UART: RX/TX (Poll, Interrupt, DMA)

UART: STM32-PC USB-TTL

UART: DMA (Rx/Tx)

UART: Receive Unknown Length Data

UART: Half-Duplex (Single Wire)

UART: 1-Wire Protocol + DS18B20

STM32 SPI Tutorial

SPI: RX/TX (Poll, Interrupt, DMA)

STM32 I2C Tutorial

I2C Scanner

USB: CDC Device (VCP)

Wireless &amp; IoT

HC-05 Bluetooth (Master-Slave)

STM32 Displays

LCD 16x2 Display

I2C LCD 16x2 Display

7-Segments Display

Dot Matrix (MAX7219)

STM32 Sensors

Internal Temperature Sensor

LM35 Temperature Sensor

LDR (Light Sensor)

HC-SR04 Ultrasonic Sensor

Capacitive Touch Button

Motors, Drivers, Actuators

DC Motors + L293D

Servo Motors

28BYJ-48 Unipolar Stepper Motor

Brushless (BLDC) Motors

STM32 Modules

Buttons &amp; LEDs

Keypad 4x4

Analog Joystick

SD Card: SPI

SD Card: SDIO

SD Card: SDIO + DMA

SD Card: SDMMC

Buzzer (Active &amp; Passive)

STM32 Useful Guides

STM32 Blue Pill Pinout

STM32 Proteus Simulation

STM32 Button Debouncing

STM32 Boot Modes

GPIO Registers Programming

STM32 FPU Unit Enable

Touch Sensing Without TSC

STM32 Arduino

STM32 Arduino Programming

Subscribe To Our YouTube Channel






Search The Website

Search For Other Content




Categories

Categories
Select Category
Electronics
&nbsp;&nbsp;&nbsp;Electronic Components
&nbsp;&nbsp;&nbsp;Electronics Projects
&nbsp;&nbsp;&nbsp;Electronics Tutorials
Embedded Systems
&nbsp;&nbsp;&nbsp;Articles
&nbsp;&nbsp;&nbsp;Embedded Projects
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Arduino Projects
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;IoT Projects
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ESP32 Projects
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Raspberry Pi Projects
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Raspberry Pi Pico RP2040 Projects
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Raspberry Pi Pico2 RP2350 Projects
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;RISC-V MCUs Projects
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;STM32 Projects
&nbsp;&nbsp;&nbsp;Embedded Tutorials
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Arduino
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;IoT
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ESP32
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Microchip PIC
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Raspberry Pi
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Raspberry Pi Pico
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;STM32 ARM
&nbsp;&nbsp;&nbsp;ESM
FAQs
FPGA
Projects Ideas
Tech Reviews

Subscribe To Our Newsletter To Get All New Updates







Type your email…











Subscribe















Categories
Categories
Select Category
Electronics
&nbsp;&nbsp;&nbsp;Electronic Components
&nbsp;&nbsp;&nbsp;Electronics Projects
&nbsp;&nbsp;&nbsp;Electronics Tutorials
Embedded Systems
&nbsp;&nbsp;&nbsp;Articles
&nbsp;&nbsp;&nbsp;Embedded Projects
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Arduino Projects
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;IoT Projects
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ESP32 Projects
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Raspberry Pi Projects
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Raspberry Pi Pico RP2040 Projects
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Raspberry Pi Pico2 RP2350 Projects
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;RISC-V MCUs Projects
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;STM32 Projects
&nbsp;&nbsp;&nbsp;Embedded Tutorials
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Arduino
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;IoT
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ESP32
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Microchip PIC
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Raspberry Pi
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Raspberry Pi Pico
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;STM32 ARM
&nbsp;&nbsp;&nbsp;ESM
FAQs
FPGA
Projects Ideas
Tech Reviews





Search The Website
Search The BlogSearch



Resources

STM32 ARM MCUs Programming Course

Embedded Systems - PIC Course

DeepBlue Patreon Page

PayPal Donation

Books Recommendation List












ABOUT DEEPBLUE

DeepBlueMbedded is an educational website where you can find technical content (Articles – Tutorials – Projects – etc..). Mainly on Embedded Systems &amp; ECE Related topics. You’ll find also downloadable resources like firmware code examples, schematics, hardware designs, and more.

It’s been and will always be a free resource of information. So, please consider supporting this work if possible.

SHARE &amp; SUPPORT

You can always show your support by sharing my articles and tutorials on social networks. It’s the easiest way to support my work that costs nothing and would definitely be appreciated!

&nbsp;

OR You Can Support Me Through This Link

SUPPORT

DISCLOSURE

DeepBlueMbedded.com is a participant in the Amazon Services LLC Associates Program, eBay Partner Network EPN, affiliate advertising programs designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com and eBay.com&nbsp;

You can also check my Full&nbsp;Disclaimer&nbsp;Page For More Information.

Copyright © 2026 DeepBlueMbedded.com . All Rights Reserved.

Privacy Policy  |  Trademark Information  |  Disclaimer





