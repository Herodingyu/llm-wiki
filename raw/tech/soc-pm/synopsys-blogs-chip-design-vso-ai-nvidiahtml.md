> 来源: www.synopsys.com
> 原URL: https://www.synopsys.com/blogs/chip-design/vso-ai-nvidia.html
> 收集时间: 2026-05-01

# How NVIDIA Uses Functional Verification Tools | Synopsys Blog




























































How NVIDIA Uses Functional Verification Tools | Synopsys Blog









































































































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

Reducing Manual Effort and Achieving Better Chip Verification Coverage with AI and Formal Techniques







Taruna Reddy




Sep 04, 2024

/
6 min read














































Table of Contents






NVIDIA Tests Chip Design Verification Tools





























Subscribe to Our Blog

Thanks for subscribing to the blog! You’ll receive your welcome email shortly.


























































##








Given the size and complexity of modern semiconductor designs, functional verification has become a dominant phase in the chip development cycle. Coverage lies at the very heart of this process, providing the best way to assess verification progress and determine where to focus further effort. Code coverage of the register transfer level (RTL) chip design, functional coverage as specified by the verification team, and coverage derived from assertions are combined to yield a single metric for verification thoroughness.

Coverage goals are usually quite high (95% or more) and hard to achieve. Chip verification engineers spend weeks or months trying to hit unreached coverage targets to ensure that the design is thoroughly exercised and bugs are not missed. Traditionally this has involved a lot of manual effort, consuming valuable human resources and delaying project schedules. Fortunately, in recent years several powerful techniques have been developed to automate the coverage process, achieve faster coverage closure, and end up with higher overall coverage.































##


























































































##

Enhance Your Chip Design with AI






Explore the enhanced Synopsys.ai brochure, featuring cutting-edge advancements in Advanced Optimization, Generative AI, and Agentic AI to transform your chip design process.




Discover More






































##












































##

NVIDIA Tests Chip Design Verification Tools






A presentation by NVIDIA at the Synopsys Users Group (SNUG) Silicon Valley 2024 event described a project in which the chip verification coverage enhancement techniques of test grading, unreachability analysis, and artificial intelligence (AI) were highly successful. The NVIDIA team carefully measured the impact across three generations of related chips, providing an exceptionally quantitative case study. The designs involved were large, with more than 100 million coverage targets. Many blocks were multiply instantiated, with unique tie-offs for each instance.&nbsp;

On the baseline design, Project A, this design topology made coverage convergence very challenging. The tie-offs left each instance with large unreachable cones of logic whose coverage targets could never be hit by any test. Each instance required its own unique set of coverage exclusions, so each instance had to be signed off for coverage independently. As shown in the following example for one set of coverage targets, convergence using a constrained-random testbench was slow and a large manual effort was required to reach coverage signoff.&nbsp;


























































##








Some important design bugs were not found until late in the project, a cause for concern. The chip verification engineers wanted to accelerate coverage to find bugs earlier and to reduce the amount of manual effort required. The first technique they tried on the derivative Project B was test grading, available in the Synopsys VCS® simulator. Test grading analyzes the simulation tests and ranks them according to achieved coverage. This enables verification engineers to set up simulation regressions in which the most productive tests run more often, with more seeds, than less productive tests. Coverage converges more efficiently, saving project resources.&nbsp;

Test grading was a good first step, but the team still faced the challenge of the many unreachable coverage targets in the design. They found an effective solution with Synopsys VC Formal and its Formal Coverage Analyzer (FCA) application (app), which determines the unreachable coverage targets in the RTL design. This eliminates the traditional quagmire in which the verification team spends enormous time and resources trying to hit coverage targets that can never be reached.&nbsp;

Formal analysis conclusively determines unreachable coverage targets and removes them from consideration for future simulations. This benefits the overall coverage calculation:


























































##








Excluding the unreachable coverage targets boosts total coverage by eliminating apparent coverage holes that are actually unreachable and by reducing the total number of coverage targets to be hit in simulation. This is a completely automated process. The FCA app generates an exclusions file with the specific unreachable coverage points for each unique instance in the design. As shown in the following graph, the combination of test grading and unreachability analysis on Project B achieved a major “shift left” in coverage by two key milestones.


























































##








In their SNUG presentation, the NVIDIA engineers reported the following learnings from Project B:

Focus early on test grading to improve stimulus productivity to hit more coverage
Focus early on coverage to uncover bugs earlier, which increases design quality and saves integration effort
Use automatic unreachability exclusion to save manual effort, focus verification efforts on reachable coverage gaps, and find bugs earlier
Achieve a left shift in coverage and bug finding by applying test grading and unreachability analysis effectively
Experiment with the tools, learn, and adjust to enhance verification methodologies

After the results of Project B, the verification team was eager to try additional techniques to further shift left the verification process. For project C, they experimented with AI-based techniques, starting with the Synopsys VSO.ai Verification Space Optimization solution. It includes a Coverage Inference Engine to help define coverage points based on both simulated stimulus and the RTL design. It also uses connectivity engines and a machine learning (ML) based solver to target hard-to-hit coverage points.&nbsp;

The verification team first tried Synopsys VSO.ai in the late stage of Project C, using a constrained random testbench complaint with the Universal Verification Methodology (UVM). The results over using just test grading and unreachability analysis were impressive: adding VSO.ai achieved 33% more functional coverage in the same number of test runs while reducing the size of the regression test suite by 5X. Code coverage and assertion coverage improved by 20% in the same number of runs with an impressive 16X regression compression over the baseline.

Using a different set of baseline regression tests,&nbsp; the engineers experimented with the Intelligent Coverage Optimization (ICO) capability in Synopsys VCS. ICO enhances test diversity using reinforcement learning, resulting in faster regression turnaround time (TAT), faster coverage closure, higher achieved coverage, and discovery of more design and testbench bugs. ICO provides testbench visibility and analytics, including stimulus distribution histograms and diversity metrics. It also provides root cause analysis to determine the reasons for low coverage, such as skewed stimulus distribution or over/under constraining.&nbsp;

As shown in the graph below, applying ICO, VSO.ai, and unreachability analysis achieved 17% more coverage in the same number of runs with a 3.5x compression of regression tests compared to the baseline. Four unique bugs were also uncovered.


























































##








The NVIDIA team reported the following learnings from Project C:

Better functional, code, and assertion coverage in the same number of runs&nbsp;
Faster coverage, improved coverage, and better regression compression
More bugs discovered due to better exercise of the design

The SNUG presentation concluded with a summary of the results from the three chip projects. Unreachability analysis provided the single biggest gain, boosting coverage metrics by 10-20% with minimal effort. The combination of chip verification technologies resulted in as up to 33% better functional coverage with 2-7X regression compression on all testbenches. They found that ICO uncovered unique bugs and that VSO.ai could be used across all project milestones.&nbsp;

The recommendation from the NVIDIA verification engineers is that test grading be used from the very beginning of the project to improve stimulus effectiveness. VSO.ai should be used for early milestones, when stimulus is immature, to achieve high regression compression, and continued through late stage milestones for additional compression and for increasing the total coverage. Finally, ICO and unreachability analysis should be enabled in mid-project to reduce compute resources, left-shift coverage by at least one milestone, and find unique bugs earlier. The combined power of all four technologies will benefit any complex chip project.



































##


Synopsys.ai: AI-Driven EDA









Optimize silicon performance, accelerate chip design and improve efficiency throughout the entire EDA flow with our advanced suite of AI-driven solutions.





Get Started























































About Synopsys



Customer Spotlight



AI &amp; Machine Learning



Verification










































##

Continue Reading





























































3 min read
/
Apr 29, 2026



##

New Synopsys.ai Copilots Deliver 2–5× Faster Chip Design Productivity











By


Anand Thiruvengadam







Tags:

Static &amp; Formal Verification,

AI &amp; Machine Learning,

Debug,

Test,

About Synopsys,

Physical Implementation,

Signoff,

IDE,

Static Verification,

Engineering Central,

Design,

Verification,

Formal Verification




Read Article






















6 min read
/
Apr 13, 2026



##

Synopsys CEO Sassine Ghazi Outlines the Future of Technology Engineering











By


Greg Sorber







Tags:

Executive Voices,

AI &amp; Machine Learning,

Fusion Technology,

Design,

About Synopsys,

Verification




Read Article






















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

Responsible Business

Investor Relations

Office Locations

Ecosystem Partners

Leadership

Corporate Governance &amp; Ethics

Strategic Acquisitions




## Resources


Services

Academic &amp; Research Alliances (SARA)

Interoperability

Contact Us

News Releases

Executive Briefing Center

University Program

Manage Subscriptions

Sitemap




## Trending


Synopsys and Ansys Are Now United

Mastering AI Chip Complexity

The A to Z of Multi-Die Design

Multi-Die Design Start Guide

Building an AI Chip: Pre Silicon Planning

Securing Silicon From the Start




## Learn


What is an AI Accelerator?

What is AI Chip Design?

What are Chiplets?

What is EDA?

What is Edge AI?

What is an Integrated Circuit?

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



























































