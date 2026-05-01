> 来源: deepbluembedded.com
> 原URL: https://deepbluembedded.com/stm32-pwm-example-timer-pwm-mode-tutorial/
> 收集时间: 2026-05-01

# STM32 PWM Output Example Code (PWM Generation Tutorial)







STM32 PWM Output Example Code (PWM Generation Tutorial)





































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




## STM32 PWM Output Example Code (PWM Generation Tutorial)

by Khaled Magdy





In this tutorial, we&#8217;ll discuss the STM32 PWM output generation using STM32 timer modules in the PWM mode. You&#8217;ll learn how the PWM signal is generated, how to control its frequency, duty cycle, and how to estimate the PWM resolution. And how to set up the timer module to operate in PWM mode and write a simple STM32 PWM Example Code (LED dimmer). And without further ado, let&#8217;s get right into it!

## Table of Contents

STM32 PWM Introduction

STM32 PWM Mode in Timer Explained

STM32 PWM HAL Functions

STM32 PWM Output Example LED Dimmer

STM32 PWM Example LED Dimmer

STM32 PWM Wrap-Up

## STM32 PWM Introduction

Pulse&nbsp;Width&nbsp;Modulation (PWM) is a technique for generating a continuous HIGH/LOW alternating digital signal and programmatically controlling its pulse width and frequency. Certain loads like (LEDs, Motors, etc) will respond to the&nbsp;average voltage&nbsp;of the signal which gets higher as the PWM signal’s pulse width is increased. This technique is widely used in embedded systems to control LEDs brightness, motor speed, and other applications.

## PWM Frequency

The PWM signal captures a few features. The first of which is the frequency, which is basically a measure of how fast the PWM signal keeps alternating between HIGH and LOW. The frequency is measured in Hz and it&#8217;s the inverse of the full period time interval. Here is how it looks graphically and its mathematical formula.

## PWM Duty Cycle

The PWM&#8217;s duty cycle is the most important feature that we&#8217;re always interested in. It&#8217;s a measure of how long the PWM signal stays ON relative to the full PWM&#8217;s cycle period. The PWM&#8217;s duty cycle equation is as follows:

The duty cycle is usually expressed as a percentage (%) value because it&#8217;s a ratio between two-time quantities. And it directly affects the PWM&#8217;s total (average) voltage that most devices respond to. That&#8217;s why we typically change the duty cycle to control things like LED brightness, DC motor speed, etc.

## PWM Resolution

The PWM resolution is expressed in (bits). It&#8217;s the number of bits that are used to represent the duty cycle value. It can be 8bits, 10, 12, or even 16bits. The PWM resolution can be defined as the number of discrete duty cycle levels between 0% and 100%. The higher the PWM resolution, the higher the number of discrete levels over the entire range of the PWM&#8217;s duty cycle.

A PWM resolution of only 3 bits means there are only 8 discrete levels for the duty cycle over the entire range (from 0% up to 100%). On the other hand, a PWM with a resolution of 8 bits will have 256 discrete levels for the duty cycle over the entire range (from 0% up to 100%). You can use the interactive tool below to test this yourself.





Average voltage:




LED





PWM Duty Cycle:



50%




PWM Frequency:



x Hz




PWM Duty Cycle Resolution:

2 bits
3 bits
4 bits
5 bits
6 bits
8 bits
10 bits
16 bits



Set the PWM resolution to 3-bit and sweep across the entire range of PWM's duty cycle. And change the resolution up to 8 bits or even 16 bits to see the huge difference in the degree of control you'll have over the duty cycle value. It becomes incredibly smooth as the resolution increases and we become more able to fine-tune the duty cycle. You can use the keyboard arrow keys for fine adjustment of the duty cycle while testing high resolutions.

❕  Note

After playing around with the interactive tool above, you can easily tell that a higher PWM resolution is always a desirable thing to have. However, it's always in inverse proportion to the PWM's frequency. The higher the PWM frequency you choose, the lower the PWM resolution becomes. There is no way to go around this fact.

## STM32 PWM Mode in Timer Explained

As we've discussed in an earlier tutorial, the STM32 timer modules can operate a variety of modes one of which is the PWM mode. Where the timer gets clocked from an internal source and counts up to the auto-reload register value, then the output channel pin is driven HIGH. And it remains until the timer counts reach the CCRx register value, the match event causes the output channel pin to be driven LOW. And it remains until the timer counts up to the auto-reload register value, and so on.

The resulting waveform is called PWM (pulse-width modulated) signal. Whose frequency is determined by the internal clock, the Prescaler, and the ARRx register. And its duty cycle is defined by the channel CCRx register value. The PWM doesn't always have to be following this exact same procedure for PWM generation, however, it's the very basic one and the easier to understand the concept. It's called the up-counting PWM mode. We'll discuss further advanced PWM generation techniques as we go on in this series of tutorials.

The following diagram shows you how the ARR value affects the period (frequency) of the PWM signal. And how the CCRx value affects the corresponding PWM signal's duty cycle. And illustrates the whole process of PWM signal generation in the up-counting normal mode.

## STM32 Timers - PWM Output Channels

Each Capture/Compare channel is built around a capture/compare register (including a shadow register), an input stage for capture (with a digital filter, multiplexing, and Prescaler) and an output stage (with comparator and output control). The output stage generates an intermediate waveform which is then used for reference: OCxRef (active high). The polarity acts at the end of the chain.

And here is a diagram for the capture/compare channel 1 Full Circuitry

And here is a diagram for the output stage that driver the OCx pins

A single STM32 timer usually has multiple channels (4, 6, or whatever is found in the datasheet). Therefore, using a single timer you can independently generate multiple PWM signals with different duty cycles of course, but they'll share the same timing (same frequency), and all of them will be in sync. We'll do this in the 2nd LAB in this tutorial after we set up a single PWM channel and get everything up and running.

Here is a snapshot of the general-purpose Timer2 diagram, which highlights the presence of multiple output compare channels and output drivers.

## STM32 Timers In PWM Mode

Pulse width modulation mode allows for generating a signal with a frequency determined by the value of the TIMx_ARR register and a duty cycle determined by the value of the TIMx_CCRx register. The PWM mode can be selected independently on each channel (one PWM per OCx output) by writing 110 (PWM mode 1) or ‘111 (PWM mode 2) in the OCxM bits in the TIMx_CCMRx register.

The user must enable the corresponding preload register by setting the OCxPE bit in the TIMx_CCMRx register, and eventually the auto-reload preload register by setting the ARPE bit in the TIMx_CR1 register.

OCx polarity is software programmable using the CCxP bit in the TIMx_CCER register. It can be programmed as active high or active low. For applications where you need to generate complementary PWM signals, this option will be suitable for you.

In PWM mode (1 or 2), TIMx_CNT and TIMx_CCRx are always compared to determine whether TIMx_CCRx ≤ TIMx_CNT or TIMx_CNT ≤ TIMx_CCRx (depending on the direction of the counter). The timer is able to generate PWM in edge-aligned mode or center-aligned mode depending on the CMS bits in the TIMx_CR1 register.

❕  Note

Note That PWM signals have a lot of properties that we need to control in various applications. The first of which is the frequency of the signal. And secondly, and probably the most important one, is the duty cycle. Third, is the PWM resolution. And much more to be discussed in later tutorials, we'll get into those 3 properties in the next sections below.

## STM32 PWM Frequency

In various applications, you'll be in need to generate a PWM signal with a specific frequency. In servo motor control, LED drivers, motor drivers, and many more situations where you'll be in need to set your desired frequency for the output PWM signal.

The PWM period (1/FPWM) is defined by the following parameters: ARR value, the Prescaler value, and the internal clock itself which drives the timer module FCLK. The formula down below is to be used for calculating the FPWM for the output. You can set the clock you're using, the Prescaler, and solve for the ARR value in order to control the FPWM and get what you want.

## STM32 PWM Duty Cycle

In normal settings, assuming you're using the timer module in PWM mode and generating a PWM signal in edge-aligned mode with up-counting configuration. The duty cycle percentage is controlled by changing the value of the CCRx register. And the duty cycle equals (CCRx/ARR) [%].

## STM32 PWM Resolution

One of the most important properties of a PWM signal is the resolution. It's the number of discrete duty cycle levels that you can set it to. This number determines how many steps the duty cycle can take until it reaches the maximum value. So, the step size or the number of duty cycle steps can tell how fine can you change the duty cycle in order to achieve a certain percentage. This can be extremely important in some audio applications, motor control, or even light control systems.

This is the STM32 PWM resolution formula that can be used to calculate the resolution of the PWM signal at a specific frequency or even the opposite. If you're willing to get a 10-Bit resolution PWM signal, what should the frequency be in order to achieve this? And so on..

In other situations, you'll need to adjust the ARR value. Therefore, you'll need to know the relationship between it and the PWM resolution. This is not a new formula, it's derived from the first one and the FPWM equation that you've seen earlier in this tutorial. We'll need it in later tutorials to design our Motor driver library and some other applications.

Check this table which shows you some example frequencies and the PWM resolution at each FPWM frequency.

## STM32 PWM Different Modes

The PWM signal generation can be done in different modes, I'll be discussing two of them in this section. The edge-aligned and the center-aligned modes.

1- Edge-Aligned Mode

In the edge-aligned PWM mode there exist a couple of possible configurations:

Up-Counting Configuration

Down-Counting Configuration

In the following example, we consider PWM mode 1. The reference PWM signal OCxREF is high as long as TIMx_CNT &lt;TIMx_CCRx else it becomes low. If the compare value in TIMx_CCRx is greater than the auto-reload value (in TIMx_ARR) then OCxREF is held at ‘1. If the compare value is 0 then OCxREF is held at ‘0.

2- Center-Aligned Mode

The compare flag is set when the counter counts up when it counts down or both when it counts up and down depending on the CMS bits configuration. The direction bit (DIR) in the TIMx_CR1 register is updated by hardware and must not be changed by software.

The diagram below shows some center-aligned PWM waveforms in an example where: TIMx_ARR=8, PWM mode is the PWM mode 1.

## STM32 PWM HAL Functions

The STM32 PWM HAL functions that you'll need to use is the
HAL_TIM_PWM_Start() and
HAL_TIM_PWM_Stop() functions. These are used to enable or disable the PWM channel output signal. You just need to configure the PWM output channel properly at first using CubeMX as we'll see in the example hereafter.

Both functions take two parameters only (the timer module handle, and the PWM channel number). Here is an example call to the
HAL_TIM_PWM_Start() function to enable the PWM_CH1 in hardware Timer2 peripheral.

HAL_TIM_PWM_Start(&amp;htim2, TIM_CHANNEL_1);

To change the duty cycle of the PWM signal, you only need to write the value to the corresponding
CCR register. Let's consider the same example of PWM_CH1 in hardware Timer2 which has an
ARR register value of 65535. Let's say we'd like to set this channel's PWM output duty cycle to 25%. Here is how to do it in code.

DutyCycle = CCR/ARR

0.25 = CCR / 65535

The value we need to write to the CCR register to set the duty cycle to 25% is, therefore, 16383. So, we can set the PWM's duty cycle in code as shown below:

TIM2-&gt;CCR1 = 16383;

You can change the line above
TIMx-&gt;CCRy to match the numbers of the hardware timer you're using (x) and the PWM output channel (y) and you're good to go.

## STM32 PWM Output Example LED Dimmer

In this STM32 PWM example, we'll do the following:

Set up timer 2 to operate in PWM mode with the internal clock. And enable CH1 to be the PWM output channel.

Set the ARR value to the maximum 65535 for example, so the frequency should be 1098Hz

Control the duty cycle by writing to the CCR1 register

Make Duty Cycle sweep from 0% up to 100% back and forth

## STM32 PWM Example LED Dimmer

In this LAB, our goal is to build a system that sweeps the duty cycle of the PWM channel1 from 0 up to 100% back and forth. So that the LED brightness follows the same pattern. The auto-reload register will be set to a maximum value which is 65535, for no particular reason.

But you should know that the output FPWM frequency is expected to be 1098.6Hz from the equation we've seen earlier. And the PWM resolution is estimated to be 16-Bit which is the maximum possible value for this module.

## STM32 PWM CubeMX HAL Configuration Steps

#1

Open CubeMX, Create a New Project, Choose The Target MCU &amp; Double-Click Its Name

#2

Configure Timer2 Peripheral To Operate In PWM Mode With CH1 Output

#3

Set The RCC External Clock Source

#4

Go To The Clock Configuration, Set The System Clock to 72MHz

#5

Name &amp; Generate The Project Initialization Code For CubeIDE or The IDE You're Using

## STM32 PWM Example Code

#include "main.h"

TIM_HandleTypeDef htim2;

void SystemClock_Config(void);
static void MX_GPIO_Init(void);
static void MX_TIM2_Init(void);

int main(void)
{
int32_t CH1_DC = 0;

HAL_Init();
SystemClock_Config();
MX_GPIO_Init();
MX_TIM2_Init();
HAL_TIM_PWM_Start(&amp;htim2, TIM_CHANNEL_1);
while (1)
{
while(CH1_DC &lt; 65535)
{
TIM2-&gt;CCR1 = CH1_DC;
CH1_DC += 70;
HAL_Delay(1);
}
while(CH1_DC &gt; 0)
{
TIM2-&gt;CCR1 = CH1_DC;
CH1_DC -= 70;
HAL_Delay(1);
}
}
}

## Testing Results

Note that the frequency is exactly 1098.6Hz!

The resulting PWM LED Dimmer

Required Parts For STM32 Examples

All the example Code/LABs/Projects in this STM32 Series of Tutorials are done using the Dev boards &amp; Electronic Parts Below:

QTY.Component NameAmazon.comAliExpresseBay1STM32-F103 BluePill Board (ARM Cortex-M3 @ 72MHz)AmazonAliExpresseBay1Nucleo-L432KC (ARM Cortex-M4 @ 80MHz)AmazonAliExpresseBay1ST-Link V2 DebuggerAmazonAliExpresseBay2BreadBoardAmazonAliExpresseBay1LEDs KitAmazon &amp;&nbsp;AmazonAliExpresseBay1Resistors KitAmazon &amp;&nbsp;AmazonAliExpresseBay1Capacitors KitAmazon &amp;&nbsp;AmazonAliExpress &amp; AliExpresseBay&nbsp;&amp;&nbsp;eBay1Jumper Wires PackAmazon &amp;&nbsp;AmazonAliExpress &amp; AliExpresseBay&nbsp;&amp;&nbsp;eBay1Push ButtonsAmazon &amp;&nbsp;AmazonAliExpresseBay1PotentiometersAmazonAliExpresseBay1Micro USB CableAmazonAliExpresseBay

★ Check The Links Below For The Full Course Kit List &amp; LAB Test Equipment Required For Debugging ★

STM32 Course Kit

LAB Test Equipment Setup

Download Attachments

You can download all attachment files for this Article/Tutorial (project files, schematics, code, etc..) using the link below. Please consider supporting my work through the various support options listed in the link down below. Every small donation helps to keep this website up and running and ultimately supports our community.

DOWNLOAD

DONATE HERE

## STM32 PWM Wrap-Up

To conclude this tutorial, we'd like to highlight the fact that you can easily generate PWM signals with STM32 microcontrollers using the hardware timers in PWM mode. Which generates a PWM signal and we can control its frequency &amp; duty cycle. This tutorial is a fundamental part of our STM32 Series of Tutorials because we’ll use it in so many tutorials and projects hereafter. So make sure, you’ve learned all the concepts and implemented the practice examples.

This was the 1st tutorial in the STM32 PWM Tutorial Series which you can navigate through using the links in the table below.

(1) STM32 PWM Output Tutorial

(5) 3-Phase PWM (Center-Aligned)

(2) PWM Frequency &amp; Resolution

(6) 3-Phase PWM (Edge-Aligned)

(3) PWM Input Mode

(7) STM32 PWM Phase Shift (Timer-Synchronized)

(4) Complementary PWM &amp; Dead-Time

(8) STM32 PWM Shutdown (Break Input)

If you're just getting started with STM32, you need to check out the&nbsp;STM32 Getting Started Tutorial&nbsp;here.

And follow this&nbsp;STM32 Series of Tutorials&nbsp;to learn more about STM32 Microcontrollers Programming.


## Related

Share This Page With Your Network!



Join Our +25,000 Newsletter Subscribers!

Stay Updated With All New Content Releases. You Also Get Occasional FREE Coupon Codes For Courses &amp; Other Stuff!








Type your email…











Subscribe









Categories Embedded Systems, Embedded Tutorials, STM32 ARM

Tags STM32 Core


Multiplexing 7-Segment Displays 3 Digit 7-Segment Interfacing With PIC Microcontrollers

STM32 EcoSystem (Development Environment) Setup



Author

Khaled Magdy

Embedded systems engineer with several years of experience in embedded software and hardware design. I work as an embedded SW engineer in the Automotive &amp; e-Mobility industry. However, I still do Hardware design and SW development for DSP, Control Systems, Robotics, AI/ML, and other fields I'm passionate about.

I love reading, writing, creating projects, and teaching. A reader by day and a writer by night, it's my lifestyle. I believe that the combination of brilliant minds, bold ideas, and a complete disregard for what is possible, can and will change the world! I will be there when it happens, will you?







## 5 thoughts on &ldquo;STM32 PWM Output Example Code (PWM Generation Tutorial)&rdquo;








Christiaan Meerkerk



January 17, 2021 at 12:34 AM








My project isnt recognising those 3 rows

SystemClock_Config();

MX_GPIO_Init();

MX_TIM2_Init();

Where are they and how are they generated?
Reply








Khaled Magdy



January 17, 2021 at 2:03 AM








Those functions are generated by CubeMX and you can find the definition of each function in the main.c file
Reply








Reza Ikhsan Ardhani



January 21, 2021 at 5:08 AM








can you give wiring this experiment?

thank you
Reply





Pingback: Part 3: Initial design of the real-time platform – Low cost real-time closed-loop control of a consumer printer &#8211; Max&#8217; Control Systems blog








Kamran Rashid



April 27, 2024 at 4:40 AM








Hi I want to to learn STM32CUBEIDE code for a 3 phase bldc motor to control speed with pot cw ccw start stop can you help coding min max speed
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





