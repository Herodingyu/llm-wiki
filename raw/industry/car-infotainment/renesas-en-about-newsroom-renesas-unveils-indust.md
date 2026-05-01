> 来源: www.renesas.com
> 原URL: https://www.renesas.com/en/about/newsroom/renesas-unveils-industry-s-first-automotive-multi-domain-soc-built-3-nm-process-technology
> 收集时间: 2026-05-01

# Renesas Unveils Industry’s First Automotive Multi-Domain SoC Built with 3-nm Process Technology | Renesas

Renesas Unveils Industry’s First Automotive Multi-Domain SoC Built with 3-nm Process Technology | Renesas  Skip to main content
## Account
English
## English
English中文日本語 Samples Cart  MyRenesas
## Main navigation

## Menu

##  Back
Products     Microcontrollers &amp; Microprocessors    Amplifiers    ASIC &amp; IP    Audio, Video &amp; Display    Automotive Products    Clocks &amp; Timing    Data Converters    Interface    Memory &amp; Logic    Power Discretes    Power Management    Programmable Logic    Sensor Products    Space &amp; Harsh Environment    Switches &amp; Multiplexers    Wireless Connectivity   Cross-reference Search
##  Product Selector Microcontrollers &amp; Microprocessors
Close megamenu Product Selector RA Arm Cortex-M MCUs Product Selector RZ 32 &amp; 64-Bit MPUs Product Selector RL78 Low-Power 8 &amp; 16-Bit MCUs Product Selector RX 32-Bit Performance/Efficiency MCUs Product Selector RISC-V 32 &amp; 64-Bit MCUs &amp; MPUs Product Selector RH850 Automotive MCUs Product Selector Renesas Synergy™ Platform MCUs Product Selector Other MCUs &amp; MPUs   Applications
##  Applications
Close megamenu  Automotive Advanced Driver Assistance Systems (ADAS) E-Mobility Electric &amp; Hybrid Vehicles (EV) Infotainment Systems Vehicle Control Systems Communications Infrastructure Cloud &amp; Enterprise Networking &amp; Fixed Access Wireless Infrastructure Consumer Electronics Cameras Computing Connected Home &amp; Entertainment Power Adapters &amp; Chargers Wearables Industrial Appliances Building Automation Industrial Automation Medical &amp; Healthcare Metering Motor Drives Renewable Energy &amp; Grid Retail, Automation &amp; Payment Robotics Key Technologies Artificial Intelligence (AI) Functional Safety Gallium Nitride (GaN) Power Human Machine Interface (HMI) Motor Control Security Tracking &amp; Locationing USB   Design Resources
##  Design Resources
Close megamenu  Design &amp; Development Boards &amp; Kits Reference Designs Development Tools Software &amp; Drivers Packaging Cross-Reference Search Gadget Renesas Maker Resources Content &amp; Training Documents &amp; Downloads Training &amp; Tutorials Videos Webinars Blog Featured Tools Renesas 365 QuickConnect Platform Lab on the Cloud PowerCompass Multi-Rail Design Tool PowerNavigator Timing Commander Partners Preferred Partner Program (Systems) Renesas Ready Partner Network (Software) R-Car Consortium   Support
##  Support
Close megamenu  Support CommunitiesGet help from our expert Renesas technical staff and community. Analog Microcontrollers Microprocessors Power Management Wireless Connectivity Technical Support Knowledge Base  Support Tickets Training &amp; Events Events Training &amp; Tutorials Videos Webinars Quality &amp; Packaging Environmental Compliance Packaging Information Product Change Notifications Product Life Cycle Product Longevity Program PSIRT Quality &amp; Reliability   Sample &amp; Buy
##  Sample &amp; Buy
Close megamenu  Buy Direct from RenesasCustomers can now choose the convenience of buying direct from Renesas. Ordering Resources Check Product Availability Sample Ordering Information Orderable Part Number Guide End-of-Life (EOL) Products Sales &amp; Distributor Directory Cross-Reference Search   About
##  About
Close megamenu  About Renesas Company Information Sustainability Careers Company Culture Search for Jobs Contact Us Sales Support Technical Support Newsroom News Releases Blogs Customer Success Stories Investors IR Materials Financial Highlights Financial Calendar Stock Information  English
## English
English中文日本語 Samples Cart MyRenesas    Search
## Breadcrumb
AboutNewsroomRenesas Unveils Industry’s First Automotive Multi-Domain SoC Built with 3-nm Process Technology
## Renesas Unveils Industry’s First Automotive Multi-Domain SoC Built with 3-nm Process Technology

## 5th-Generation R-Car SoC Offers Future-Proof Multi-Domain Compute Solutions for Centralized E/E Architecture with Chiplet Extensions
Jump to Page Section:


##
November 13, 2024  Renesas Unveils 5th-Generation Multi-Domain SoC for ADAS, Infotainment and Gateway Systems

MUNICH, Germany and TOKYO, Japan ― Renesas Electronics Corporation (TSE:6723), a premier supplier of advanced semiconductor solutions, today launched the new generation of automotive fusion system-on-chips (SoCs), serving multiple automotive domains including Advanced Driver Assistance Systems (ADAS), in-vehicle infotainment (IVI), and gateway applications on a single-chip. Built using the latest 3-nanometer (nm) automotive process technology, the highly-anticipated R-Car X5H SoC, which is the first device in the R-Car X5 series, offers the highest level of integration and performance in the industry, allowing OEMs and Tier 1s to shift to centralized Electronic Control Units (ECUs) for streamlined development and future-proof system solutions. Renesas’ R-Car X5H is among the first in the industry to offer highly-integrated, secure processing solutions on a single chip for multiple automotive domains, thanks to its unique hardware-based isolation technology. Additionally, the new SoC offers the option to expand AI and graphics processing performance using chiplet technology.

As the highest performance device within the fifth-generation (Gen 5) R-Car Family, the R-Car X5H directly addresses the growing complexity of Software-Defined Vehicle (SDV) development. These challenges include optimizing compute performance, power consumption, cost, hardware and software integration – while ensuring vehicle safety. By tightly coupling application processing, real-time processing, GPU and AI compute, large display capabilities, and sensor connectivity on a single chip, these devices enable a new class of automated driving, IVI and gateway applications.

The new SoC series enables AI acceleration of up to 400 TOPS with industry-leading TOPS/W performance, and GPU processing of up to 4 TFLOPS*1. It incorporates a total of 32 Arm® Cortex®-A720AE CPU cores for application processing, delivering over 1,000K DMIPS performance; and six Arm Cortex-R52 dual lockstep CPU cores delivering over 60K DMIPS performance with support for ASIL D capabilities without external microcontrollers (MCUs). Manufactured using one of TSMC’s most advanced process nodes, the new SoC series achieves both top-end CPU performance and a 30-35 percent reduction in power consumption*2 compared to devices designed for a 5-nm process node. These power-efficient features significantly lower overall system costs by eliminating the need for additional cooling solutions while also extending vehicle driving range.
## Chiplet Extensions for Flexibility and Additional Performance

While the R-Car Gen 5 SoCs come with powerful native NPU and GPU processing engines, Renesas is offering customers the ability to scale up their performance through chiplet extensions. When combining a 400-TOPS on-chip NPU with an external NPU via a chiplet extension, for example, it’s possible to scale their AI processing performance by three to four times or more. For seamless chiplet integration, the R-Car X5H offers the standard UCle (Universal Chiplet Interconnect Express) die-to-die interconnect and APIs, facilitating interoperability with other components in a multi-die system, even if they are non-Renesas chips. This flexible design approach allows car OEMs and Tier 1s to mix and match different functions and customize their systems including future upgrades across vehicle platforms.
## Mixed-Criticality Processing for Secure Isolation

While automakers and Tier-1 suppliers are demanding more performance and functionality, safety remains their number one priority. While other SoCs rely solely on software-based isolation, the R-Car X5H SoC also offers hardware-based Freedom from Interference (FFI) technology. This hardware design implementation securely isolates safety-critical functions, such as brake-by-wire, from non-critical functions. Functions deemed safety critical can be assigned their own separate, redundant domains, each having its own independent CPU core, memory and interfaces, thus preventing potentially catastrophic vehicle failures in the event of a hardware or software fault from a different domain. The R-Car X5H also comes with Quality of Service (QoS) management that determines workload priorities and assigns processing resources in real time.

“Our latest innovations in the R-Car Gen 5 platform tackle the complex challenges the automotive industry faces today,” said Vivek Bhan, Senior Vice President and General Manager of High Performance Computing at Renesas. “Our customers are looking for end-to-end automotive-grade system solutions that cover everything from hardware optimization, safety compliance to flexible and scalable architecture selection and seamless tools and software integration. Our R-Car Gen 5 Family meets these demands and we are committed to helping the industry accelerate SDV development and Shift-Left innovations for the next era of automotive technology.”

“We are thrilled to partner with a trusted automotive technology leader like Renesas to bring their latest innovation to market using our state-of-the-art 3-nm process technology,” said Dr. Kevin Zhang, TSMC’s Senior Vice President of Business Development and Global Sales, and Deputy Co-COO. “Our N3A process is optimized for advanced automotive SoCs, with industry-leading 3-nm performance at AEC Q-100 Grade 1 reliability. We are excited to work with Renesas to develop this R-Car Gen 5 platform, and help re-shape the future of ‘silicon-defined vehicles’.”

Asif Anwar, Executive Director of Automotive Market Analysis, TechInsights, stated, “The path to the SDV will be underpinned by the digitalization of the cockpit, vehicle connectivity, and ADAS capabilities. The vehicle electric/electronic (E/E) architecture will be the core enabler as features and functions are integrated into zonal and centralized controllers that will provide the necessary compute capabilities. TechInsights forecasts the zonal controller and high-performance compute SoC processor market will grow at a CAGR of 17% between 2028 and 2031.”

Anwar continued, “Renesas is a top three supplier of automotive processors and is leveraging decades of experience with its fifth generation R-Car X5H SoC that will scale with the requirements of an SDV. By leveraging the 3-nm process, the R-Car X5H SoC allows the automotive industry to implement a multi-use solution set that can be used across the vehicle platform with optimized power budgets. Combining this with the RoX SDV platform, Renesas can offer a software-first, cross-domain approach that will shorten the time-to-market for the automotive industry.”
## The Fifth-Generation R-Car Platform with Scalability

Renesas’ R-Car Gen 5 supports the broadest range of processing requirements in the industry – from zonal ECUs to high-end central compute, serving from entry-level vehicles to luxury-class models. Thanks to a new unified hardware architecture based on Arm CPU cores, R-Car Gen 5 developers can reuse the same software and tools and applications from Renesas’ broad line of new 64-bit SoCs andfuture products including crossover 32-bit MCUs and automotive 32-bit MCUs. As part of the R-Car next-generation family, Renesas is extending its vehicle control portfolio with a new R-Car MCU series, which will be also powered by Arm. Renesas plans to sample the new 32-bit MCU series with enhanced security for body and chassis applications in Q1/2025.
## R-Car Open Access (RoX) Platform Available for SDV Development

Renesas’ latest R-Car X5H and all future Gen 5 products are designed to accelerate SDV development by combining hardware and software into a comprehensive development platform. The newly launched R-Car Open Access (RoX) SDV platform integrates all essential hardware, operating systems (OS), software and tools needed for automotive developers to rapidly develop next-generation vehicles with secure and continuous software updates. RoX provides OEMs and Tier-1 suppliers the flexibility to virtually design a broad range of scalable compute solutions for ADAS, IVI, gateway, and cross-domain fusion systems as well as body control, domain, and zone control systems.
## Demonstration at electronica 2024

Renesas will present a live demonstration of the R-Car Gen 5 development environment at electronica 2024 in Munich, Germany, November 12-15 in Hall B4, Stand 179. At the show, attendees will have the opportunity to watch how engineers can design automotive software using the Renesas Open Access (RoX) development platform.
## Availability

The R-Car X5H will be sampling to select automotive customers in 1H/2025, with production scheduled in 2H/2027. More information about the new devices is available here.

A blog on the new R-Car X5H is also available here.
## About Renesas Electronics Corporation

Renesas Electronics Corporation (TSE: 6723) empowers a safer, smarter and more sustainable future where technology helps make our lives easier. A leading global provider of microcontrollers, Renesas combines our expertise in embedded processing, analog, power and connectivity to deliver complete semiconductor solutions. These Winning Combinations accelerate time to market for automotive, industrial, infrastructure and IoT applications, enabling billions of connected, intelligent devices that enhance the way people work and live. Learn more at renesas.com. Follow us on LinkedIn, Facebook, X, YouTube, and Instagram.

(Remarks) All names of products or services mentioned in this press release are trademarks or registered trademarks of their respective owners.

*1 Equivalent TFLOPS based on data from Manhattan 3.1 industry benchmarks.

*2 Data is based on Renesas’ design implementation.

The content in the press release, including, but not limited to, product prices and specifications, is based on the information as of the date indicated on the document, but may be subject to change without prior notice.
## Share this news on
linkedinfacebookx

Back to Top
## Stay Informed

Get the latest news, products, and solutions delivered straight to your inbox.Sign Up Now  YouTubeRenesas’s Twitter/XFacebookInstagramLinkedIn
## Corporate
Overview Careers Investors News Sustainability Contact Blog Videos
## Top Tools
e² studio CS+ Renesas Flash Programmer MCU / MPU Selection Tool iSim:PE Offline Simulation Tool PowerCompass Multi-Rail Design Tool PowerNavigator Lab on the Cloud Cross-Reference Search
## Sample &amp; Buy
Technical Support Free Sample Request Check Product Availability Sales and Distributor Directory
## Language
English中文日本語    &copy;2026 Renesas Electronics Corporation.
## Legal footer
Notices &amp; Terms Privacy Policy Accessibility Sitemap Website Feedback