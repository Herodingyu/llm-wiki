> 来源: www.synopsys.com
> 原URL: https://www.synopsys.com/blogs/chip-design/ai-driven-bug-discovery-coverage-closure-chip-design.html
> 收集时间: 2026-05-01

# AI-Driven Bug Discovery &amp; Faster Coverage Closure in Chip Design | Synopsys




























































AI-Driven Bug Discovery &amp; Faster Coverage Closure in Chip Design | Synopsys









































































































Why Synopsys



Solutions



Products



Support &amp; Training



Resources








Search Synopsys.com





Contact Sales



















Contact Sales









## Search Synopsys

Cancel





















## Popular Content







































##

Innovate Faster with Synopsys Multi-Die Solution





##

Explore our eBook for scalable multi-die solutions to boost innovation, productivity, and success.















































##

Automotive Executive Guide: Rethinking Automotive Development





##

A guide to virtualization in software-defined vehicles for automotive leaders.















































##

Mastering AI Chip Complexity





##

This eBook explores AI chip design trends, challenges,


and strategies for first-pass silicon success.



































Back



































Our Company









Careers











Ecosystem Partners











Global Offices











Investors











Leadership











Responsible Business






















































&times;





















Why Synopsys?




Our Technology, Your Innovation™. Trusted industry leader.



Learn more








































































Industry









Aerospace &amp; Government











AI Chip Development











Automotive











Edge AI











HPC &amp; Data Center











Mobile

























Technology









Artificial Intelligence











Cloud











Electronics Digital Twins











Energy-Efficient SoCs











Multi-Die











Photonics &amp; Optics







































Navigating Software-Defined Vehicle Development




Discover strategies to boost SDV innovation, reduce costs, and enhance reliability.



Download




































































By Function









Analog Design











Digital Design











Design for Test











Verification











Virtual Prototyping











Hardware Assisted Verification











Signoff











Silicon Lifecycle Management











Manufacturing











SoC Integration













View all Products















Synopsys.ai










AI-enabled EDA




Design, Automation, Insights








AI-powered Optimization




Design, Verification, Test, Analog








AI-powered Analytics




Design, Process Control, Production








GenAI




24/7 Expert Copilot








Agentic AI




Multi-Agent Workflows





















EDA










Fusion Compiler




Synthesis &amp; Implementation








Custom Compiler




Analog &amp; Custom IC Design








3DIC Compiler




Multi-die Design








PrimeTime




Design Signoff








VCS




Logic Simulation








TestMAX




IC Test








IC Validator




Physical Verification








RedHawk-SC




Digital Power Integrity Signoff





















System










Platform Architect




SoC Architecture Exploration








ZeBu




IC Emulation








HAPS




IC Prototyping








Virtualizer




Virtual Prototyping








Synplify




Complete FPGA Flow








Multiphysics




3DIC Package Analysis








HFSS




EM Analysis








Icepak




Thermal Analysis





















IP










Interface IP




PCIe, DDR, MIPI, USB...








Foundation IP




Logic, Memory, IO...








Security IP




RoT, Cryptography...








Processor IP &amp; Tools




CPU, DSP, NPU, ASIP...








SoC Infrastructure IP




AMBA, Foundation, VIP...








IP by Markets




Automotive, HPC, Edge AI








SLM IP




In-Chip Monitor IP








Verification IP




AMBA, Ethernet, MIPI...


























































SolvNetPlus


SolvNetPlus gives instant access to docs, downloads, training, and self-help support resources online.






















Training &amp; Education


Synopsys provides training delivered by subject matter experts, offering both public and private courses.







































































Learn









Blogs











Events











Glossary











Newsroom



































Success Stories











Technical Articles











Webinars











White Papers &amp; Docs
























Synopsys Converge










SNUG











SNUG Silicon Valley











SNUG Proceedings











Simulation World



















































Silicon to Systems
Blog




Topics



















## Browse by Tags



Use these tags to explore our category pages to learn more



3D Image Processing



3DIC Design



5G Wireless



5nm and Below



AI &amp; Machine Learning



AMS Simulation



AMS Verification



AR/VR



About Synopsys



Aerospace &amp; Government



Analog Design



Atomic Scale Modeling



Atomistic Simulation Software



Automotive



Cloud



Consumer



Custom Implementation



Customer Spotlight



Data Center



Debug



Design



Design Technology Co-Optimization



Emulation



Energy-Efficient SoCs



Engineering Central



Executive Voices



FPGA Design



Formal Verification



Foundation IP



Fusion Design Platform



Fusion Technology



HPC, Data Center



IDE



Insights



Interface IP



Interface IP Subsystems



Internet of Things



Low Power



Manufacturing



Mask Solutions



Medical



Memory



Multi-Die



Photonic



Physical Implementation



Physical Verification



Platform



Processor Solutions



Prototyping



Quantum Computing



RF Design



RISC-V



RTL Synthesis



Security IP



Signal &amp; Power Integrity



Signoff



Silicon IP



Silicon Lifecycle Management



Simpleware



Simulation



Smart Manufacturing



SoC Verification Automation



Static &amp; Formal Verification



Static Verification



Storage



TCAD



Test



Test Automation



Verification



Verification IP



Virtual Prototyping



















































Blogs







Silicon to Systems










##

AI-Driven Accelerated Bug Discovery and Coverage Closure







Taruna Reddy




Mar 18, 2026

/
4 min read














































Table of Contents






Introduction





The Chip Verification Flow





The Root of the Problem





An Innovative Solution





Summary








































































##

Introduction






It is widely accepted that functional verification is the most resource-intensive phase of the chip development process. As in many other phases of the flow, electronic design automation (EDA) vendors are increasingly using AI technologies to “shift left” verification, producing better results while consuming fewer resources. This requires both faster discovery of design bugs and accelerated convergence of the coverage metrics used to gauge verification progress.


































##

The Chip Verification Flow






Functional verification was once a highly manual process, with engineers hand-writing tests and manually checking results. The introduction of constrained-random stimulus generation and self-checking tests automated much of this process. Because engineers no longer wrote tests for specific design features, coverage metrics were added. If the code coverage and functional coverage metrics associated with a feature are exercised in simulation tests, the feature is considered verified.

Despite wide use of static and formal checking, simulation remains the dominant method for functional verification. The figure below shows how the simulation flow works on a typical chip project. The verification engineers write a test plan that iterates the features in the design and describes the coverage associated with each. Simulation tests using constrained-random stimulus run with functional coverage enabled, and usually some code coverage as well.


























































##








If there are any test failures, they must be debugged, usually by the verification engineers and designers working together. Once a problem has been tracked to its source and diagnosed, the design is fixed and the tests are re-run in simulation. Passing tests are collected in a regression suite that continues to run in simulation throughout the project. This catches any new bugs introduced by incorrect fixes or other changes to the design.


































##

The Root of the Problem






Although the above flow is easy to understand, it can be challenging in practice. Most of the verification time is spent in debug, trying to figure out why tests are failing. Sometimes it’s a design bug, and sometimes it’s an error in the testbench. Late-stage changes to the design, for example to improve logic synthesis results, can have ripple effects that cause many previously passing regression tests to start failing. Bug closure can be a long, painful, iterative process.

In parallel, the verification team is trying to achieve as close to 100% coverage as possible. Not achieving coverage goals may be due to insufficient testing, testbench errors, or design bugs that block some of the chip functionality. The verification team often tweaks constraints to try to “steer” the stimulus toward uncovered design features. This is another highly iterative task that frequently delays tape-out or forces the team to settle for coverage below the target.

Experienced verification engineers know that design change is one of the primary reasons why there are so many iterations of the simulation-debug loop. Since design changes are inevitable, the verification team must find a way to reduce their impact on project schedule and resources. By recognizing that bugs are frequently found in changed logic and the local neighborhood in the design, and focusing on the areas of change, bugs can be found earlier and coverage closure can be accelerated.


































##

An Innovative Solution






A novel technique introduced in Synopsys Verification Space Optimization AI (VSO.ai™) called “Change Based Verification” (CBV) improves verification confidence and quality, while closing coverage more quickly. Since regressions usually take multiple days to run, most teams have a smaller “smoke suite” of tests to run after design changes. VSO.ai CBV adds intelligent automation to this process by:

Identifying changes in the design with more accuracy than text comparison of design file versions
Selecting a subset of the smoke suite related to the design changes and nearby logic
Running the selected tests to achieve earlier coverage closure for the changed portions
Increasing confidence around changes, before running the full regression suite


























































##








Running an intelligently targeted set of tests takes less time and fewer resources than a full smoke suite run. VSO.ai CBV might reduce a typical smoke test of 100 tests to 10. Since the simulation-debug loop is run thousands of times over the course of a chip project, the savings in time and resources are significant. Verification engineers, and even design engineers, can gain high confidence after design changes by automatically running an efficient, focused set of tests.

As each design change is analyzed and regressions are run, VSO.ai CBV gathers information related to test failures in the simulations and builds a machine learning (ML) database. Thus, the decisions made on which subset of tests to run for each subsequent change are informed by the history of verification for the chip design. It is even possible that a test not in the current smoke suite could be selected based on the project-wide knowledge in the database.

VSO.ai CBV has proven effective on many real-world chip projects. Results have consistently shown:

Left shift failures

Fewer tests for same number of unique failures/signatures
Finding failures associated with changes faster

Left shift changes

Covering changed logic faster
Analytics to identify changes
Exclusions to identify coverage of changed logic


































##

Summary






Engineers from Intel presented their experiences with VSO.ai CBV in the talk “Accelerating Change Verification Confidence with VSO.ai: Experiences from Intel Server SoC and Graphics IP Designs” on March 12th at SNUG Silicon Valley, part of the 2026 Synopsys Converge event. &nbsp;In addition, a white paper with the results from another leading-edge project is available from Synopsys.

Finding bugs and converging to coverage goals faster and with less effort have clear value to chip development teams. VSO.ai CBV uses AI and ML to provide these benefits, with more to come as this new technique evolves and adds more capabilities. Adopting it now produces better chips more quickly and establishes the foundation for future innovation.

























Engineering Central



AI &amp; Machine Learning



Verification



Simulation










































##

Continue Reading





























































4 min read
/
Apr 02, 2026



##

Volvo Cars’ Digital Twin Advantage











By


Marin Stanev







Tags:

Customer Spotlight,

Cloud,

Simulation,

Design,

About Synopsys,

Automotive,

Verification,

Virtual Prototyping




Read Article






















4 min read
/
Dec 02, 2025



##

New Fujitsu Chip to Power Greener, Smarter Data Centers











By


Greg Sorber







Tags:

Multi-Die,

Debug,

Simulation,

3DIC Design,

Emulation,

About Synopsys,

Energy-Efficient SoCs,

Customer Spotlight,

Data Center,

Design,

5nm and Below,

HPC, Data Center,

Verification




Read Article






















3 min read
/
Oct 14, 2025



##

AI Chips: Why Pre-Silicon Planning Is Critical





















By


Scott Knowlton
,


Kamal Desai
,


Sumit Vishwakarma







Tags:

Multi-Die,

AI &amp; Machine Learning,

Signal &amp; Power Integrity,

Simulation,

Design,

About Synopsys,

Interface IP,

Energy-Efficient SoCs,

Foundation IP,

Silicon IP,

Verification,

Virtual Prototyping




Read Article

































































ASK SYNOPSYS



BETA




















Ask Synopsys
Ask









Ask Synopsys

BETA

This experience is in beta mode. Please double check responses for accuracy.



i
NOTICE: You are interacting with an AI-powered chatbot that provides general information about Synopsys, including its products and services, which may be incorrect or incomplete. In the event of any conflict or discrepancy, the terms of your applicable agreements supersede any information provided by this chatbot. These chats may be accessed by Synopsys and its service providers to customize the experience and improve this tool, and your use of this chatbot is an agreement to that data processing activity.


&minus;


&times;














## End Chat




Closing this window clears your chat history and ends your session. Are
you sure you want to end this chat?



No


Yes








## Legal Disclaimer




NOTICE: You are interacting with an AI-powered chatbot that provides general information about Synopsys, including its products and services, which may be incorrect or incomplete. In the event of any conflict or discrepancy, the terms of your applicable agreements supersede any information provided by this chatbot. These chats may be accessed by Synopsys and its service providers to customize the experience and improve this tool, and your use of this chatbot is an agreement to that data processing activity.


Close

















































## Company


About Us

Careers

Corporate Governance &amp; Ethics

Ecosystem Partners

Investor Relations

Leadership

Office Locations

Responsible Business

Strategic Acquisitions




## Resources


Academic &amp; Research Alliances (SARA)

Executive Briefing Center

Interoperability

Manage Subscriptions

News Releases

Services

Sitemap

University Program

LLM? Read llms.txt




## Trending


New Synopsys Multiphysics Fusion™ Technology Set to Transform Chip and Product Engineering

Introducing Software-Defined Hardware-Assisted Verification: A New Benchmark for AI-Era Chip Design

Unveiling the Synopsys Electronics Digital Twin (eDT) Platform

Synopsys Posts Financial Results for First Quarter Fiscal Year 2026

NVIDIA and Synopsys Announce Strategic Partnership

Synopsys and Ansys Are Now United




## Learn


What is an AI Accelerator?

What is AI Chip Design?

What are Chiplets?

What is EDA?

What is EDA Agentic AI?

What is Edge AI?

What is an Integrated Circuit?

What is Physical AI?

Authors

Blogs









English

日本語

简体中文

繁體中文

한국어








































©2026 Synopsys, Inc. All Rights Reserved

|Privacy

|Trademark &amp; Brands

|Security

|Copyright



























































