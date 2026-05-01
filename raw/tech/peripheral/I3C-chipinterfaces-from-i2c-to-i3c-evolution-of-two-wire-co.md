> 来源: chipinterfaces.com
> 原URL: https://chipinterfaces.com/from-i2c-to-i3c-evolution-of-two-wire-communication-in-embedded-systems/
> 收集时间: 2026-05-01

# From I2C to I3C: Evolution of Two-Wire Communication in Embedded Systems - Chip Interfaces | Interface IPs

From I2C to I3C: Evolution of Two-Wire Communication in Embedded Systems - Chip Interfaces | Interface IPs                    BlogNewsWhitepaperCompanyAbout UsManagementPartnersCareerSupport    JESD204JESD204BJESD204CJESD204DJESD204EJESD204 VIPHardware Platform &#038; Reference DesignUCIeUCIe D2D AdapterAXI-S Protocol Layer for UCIeUCIe D2D Adapter &#038; PHY Integrated IPMIPIMIPI I3C ControllerMIPI I3C Secondary ControllerMIPI I3C TargetMIPI I3C Composite DeviceMIPI RFFE MasterMIPI RFFE SlaveInterlakenInterlakenHardware Platform &#038; Reference DesignUALinkUALink PCSUALink DLUALink TLRadio InfrastructureCPRI 6.1CPRI 7.0eCPRIDiFiORAN  Select Page
## From I2C to I3C: Evolution of Two-Wire Communication in Embedded Systems

by Piotr Koziuk | Jun 17, 2025 | Blog+blog, Blog+MIPI | 0 comments

Introduction: The Legacy of I2C

The I2C (Inter-Integrated Circuit) Bus invented in 1980 by Philips Semiconductors (NXP Semiconductors today) was a massive step forward in simplifying communications in embedded systems. It is a simple two-wire interface for synchronous, multi-master/multi-slave, single ended serial communication. Fast forward 45 years to today and it is still widely used for attaching low speed peripheral Integrated Circuits (ICs), processors and microcontrollers. But silicon today has changed, we have move forward from 8-bit MCUs to multicore SOCs and from simple sensors to complex multi modal sensor devices. The demands on bandwidth, latency and power have all increased and that is where a new Improved Bus variant offers its advancements.

What Is I3C and Why Does It Matter?

I3C (Improved Inter-Integrated Circuit) Bus developed by the MIPI Alliance is a two-wire interface built on the foundation of I2C with advancements to improve speed and efficiency. It is designed to replace I2C (and partially SPI) while still remaining backwards compatible with I2C. It offers much improved clock speeds of up to 12.5 MHz, in-band interrupts with no extra wires, dynamic addressing, dual data rate with multi lane operation for up to 100Mbps operation, power efficient mode and standardized command sets. It is a faster and leaner successor built for modern embedded systems and is quickly becoming the default choice for SoC and FPGA designers.

Why Transition to I3C?, Comparison of I2C and I3C

I2C&#8217;s simplicity of one data line (SDA) and one clock line (SCL) and a Master/Slave architecture with up to 127 connected devices on the bus were the contributing factors to its success. It didn&#8217;t need a per device chip select like SPI which made it ideal for low pin count packages and simplified board routing. As technology evolve and SOCs became more and more complex and time sensitive designers started reaching limitations of I2C. Line rates and data throughput was iterated on multiple times with 400 kbit/s fast mode, 1 Mbit/s fast mode plus, 3.4 Mbit/s high-speed mode, and 5 Mbit/s ultra-fast mode. Despite these improvements the line rate proves insufficient for today&#8217;s ever increasing requirements of high-rate sensors or complex peripherals. Designers are facing challenges implementing interrupts by either having devices poll or use a separate GPIO line defeating the two-wire simplicity of routing. Multi controller setups were complicated with arbitration and often not supported by target devices.

I3C was developed by the MIPI Alliance to address these limitations and still maintain backwards compatibility with legacy I2C devices. Being able to support legacy sensors while enabling new capabilities is what makes I3C so relevant for system designers nowadays. The key advantages of I3C over I2C are plenty, the most significant being higher throughput. With its clock running up to 12.5MHz in SDR (Single Data Rate) mode it can be 10x fast than I2C even in the widely adopted fast mode plus, and more than double the speed of I2C top ultra-fast mode. But it does not end there as I3C can also run in HDR (High Data Rate) modes pushing the performance even further even up to 100 Mbps. Dynamic addressing of I3C allows assigning device addresses during bus initialization unlike I2C hard-coded or pin configurable addresses. This simplifies PCB design and enables more scalable systems. The addition of In-Band Interrupts (IBI) removed the need for external interrupt lines and allows targets to raise interrupts over the same two-wire interface in response the Controller activity and makes I3C ideal for event driven architectures. Better power efficiency is achieved thanks to multiple power-saving features. Hot Join allows devices to dynamically join the bus while it is running, devices can enter sleep and be woken efficiently, and the addition of push-pull signalling, unlike I2C&#8217;s open-drain only operations, further reduces power consumption.FeatureI2CI3CMax SpeedUp to 5 Mbps (Ultra-Fast Mode)Up to 100 Mbps (HDR Mode)InterruptsRequires separate GPIOIn-Band Interrupts (IBI)AddressingStatic (hardcoded or pin-configured)Dynamic (assigned at runtime)Power EfficiencyOpen-drain signallingOpen-drain + Push-pull signalling, sleep modesCompatibilityWidely supportedBackward compatible with I2C

Choosing the Right I3C IP Core

When evaluating and I3C IP core for your project keep in mind compliance with latest MIPI I3C specification (v1.1.1 or v1.2), backward compatibility for seamless I2C fallback which is a must for mixed environments, configurable roles including dynamic role switching for secondary master, support for HDR to take advantage of higher data rates when moving large blocks of data (HDR-DDR, HDR-TSP/TSL, HDR-BT). The transition to I3C may be gradual, especially in systems with legacy devices. There are a few indicators that it&#8217;s time to move like: you might need higher bandwidth, there are too many GPIO lines for interrupts, your design is power sensitive, or you might want a future proof protocol that reduces latency and board complexity.

Conclusion

Todays embedded systems are faster, more complex, and power-aware then back in the 80&#8217;s. The I2C has been a staple in system design for many decades and through multiple iterations. I3C is built for the new challenges and offers the same familiar two-wire simplicity with the performance the modern systems demand. If you are architecting your next ASIC or selecting peripherals for an FPGA design, I3C is a great candidate, not just as a faster bus, but as a amazing foundation for inter chip communication.

Chip Interfaces is also excited to announce its participation in the MIPI I3C®/I3C Basic™ Plugfest, taking place on June 23–24, 2025, at the Sofitel Warsaw Victoria Hotel. Meet us there

Request Datasheet Explore I3C IP Visit Blog
## Request datasheet

First name (Required)

Last name (Required)

Business Email (Required)

Company (Required)

Job Function (Required)

Phone

Product ProductCPRI 6.1CPRI 7.0DiFieCPRIInterlakenJESD204BJESD204CJESD204DJESD204 Verification IPMIPI CSI - 2MIPI I3CMIPI RFFE MasterMIPI RFFE SlaveRS FECUCIe D2D AdapterUCIe D2D Integrated PackageORANUA Link PCS

FPGA / ASIC / Fab Process / Application / Comments   Submit  About us Contact usFollow

2024 Chip Interfaces ApS. All Rights Reserved.

Customer Support | General Terms and Conditions | Privacy Policy