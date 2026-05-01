> 来源: www.lp-research.com
> 原URL: https://www.lp-research.com/slam-system-ar-vr-tracking/
> 收集时间: 2026-05-01

# SLAM system for AR/VR: Next-Gen Full Fusion Tracking - LP-Research















SLAM system for AR/VR: Next-Gen Full Fusion Tracking - LP-Research

















































































##
Advanced Sensor Fusion Solution and IMUs












##
Toggle menu


Skip to content
Home
Product

Inertial Measurement Units
Mixed Reality Tracking

Technology
Blog
Order

Online Shop
Distributors
Software EULA
Hardware TOS

Support

Software &#038; Documentation
Customer Area

Company

About Us
Contact
Our Customers

日本語





















## SLAM system for AR/VR: Next-Gen Full Fusion Tracking




LP-Research &gt; Blog &gt; Projects &gt; SLAM system for AR/VR: Next-Gen Full Fusion Tracking






















29May2025








##




















## SLAM system for AR/VR: Next-Gen Full Fusion Tracking








At LP-Research, we have been pushing the boundaries of spatial tracking with our latest developments in Visual SLAM (Simultaneous Localization and Mapping) and sensor fusion technologies. Our new SLAM system, combined with what we call &#8220;Full Fusion,&#8221; is designed to deliver highly stable and accurate 6DoF tracking for robotics, augmented and virtual reality applications.




## System Setup





To demonstrate the progress of our development, we ran LPSLAM together with FusionHub on a host computer and forwarded the resulting pose to a Meta Quest 3 mixed reality headset for visualization using LPVR-AIR. We created a custom 3D-printed mount to affix the sensors needed for SLAM and Full Fusion, a ZED Mini stereo camera and an LPMS-CURS3 IMU sensor onto a the headset.

This mount ensures proper alignment of the sensor and camera with respect to the headset&#8217;s optical axis, which is critical for accurate fusion results. The system connects via USB and runs on a host PC that communicates wirelessly with the HMD. An image of how IMU and camera are attached to the HMD is shown below.















In the current state of our developments we ran tests in our laboratory. The images below show a photo of the environment next to how this environment translates into an LPSLAM map.


















## Tracking Across Larger Areas





A walk through the office based on a pre-built map yields good results. The fusion in this experiment is our regular IMU-optical fusion and therefore doesn&#8217;t support translation information with integrating accelerometer data. This leads to short interruptions of position tracking in certain areas where feature points aren&#8217;t found. We at least partially solve this problem with the full fusion shown in the next paragraph.











## What is Full Fusion?





Traditional tracking systems rely either on Visual SLAM or IMU (Inertial Measurement Unit) data, often with one compensating for the other. Our Full Fusion approach goes beyond orientation fusion and integrates both IMU and SLAM data to estimate not just orientation but also position. This combination provides smoother, more stable tracking even in complex, dynamic environments where traditional methods tend to struggle.

By fusing IMU velocity estimates with visual SLAM pose data through a through a specialized filter algorithm, our system handles rapid movements gracefully and removes jitter seen in pure SLAM-only tracking. The IMU handles fast short-term movements while SLAM ensures long-term positional stability. Our latest releases even support alignment using fiducial markers, allowing the virtual scene to anchor precisely to the real world. The video below shows the SLAM in conjunction with the Full Fusion.











## Real-World Testing and Iteration





We&#8217;ve extensively tested this system in both lab conditions and challenging real-world environments. Our recent experiments demonstrated excellent results. By integrating our LPMS IMU sensor and running our software pipeline (LPSLAM and FusionHub), we achieved room-scale tracking with sub-centimeter accuracy and rotation errors as low as 0.45 degrees.

In order to evaluate the performance of the overall solution we compared the output from FusionHub with pose data recorded by an ART Smarttrack 3 tracking system. The accuracy of an ART tracking system is in the sub-mm range and therefore is sufficienty accurate to characterize the performance of our SLAM. The result of one of several measurement runs is shown in the image below. Note that both systems were alignment and timestamp synchronized to correctly compare poses.











## Developer-Friendly and Cross-Platform





The LP-Research SLAM and FusionHub stack is designed for flexibility. Components can run on the PC and stream results to an HMD wirelessly, enabling rapid development and iteration. The system supports OpenXR-compatible headsets and has been tested with Meta Quest 3, Varjo XR-3, and more. Developers can also log and replay sessions for detailed tuning and offline debugging.




## Looking Ahead





Our roadmap includes support for optical flow integration to improve SLAM stability further, expanded hardware compatibility, and refined UI tools for better calibration and monitoring. We’re also continuing our efforts to improve automated calibration and simplify the configuration process.

This is just the beginning. If you&#8217;re building advanced AR/VR systems and need precise, low-latency tracking that works in the real world, LP-Research&#8217;s Full Fusion system is ready to support your journey.

To learn more or get involved in our beta program, reach out to us.










29/05/2025 Blog, Projects






## About Klaus Petersen




I like to create magical things, especially projects related to new technologies like augmented and virtual reality, mobile robotics and MEMS-based sensor networks. I code in C(++) and Python, trying to keep up with my very talented colleagues :-)
View all posts by Klaus Petersen &rarr;














Previous			Next



















## Recent Posts



Revolutionizing AD/ADAS Testing: VR-Enhanced Vehicle-in-the-Loop


SLAM system for AR/VR: Next-Gen Full Fusion Tracking


Wireless Mixed Reality with LPVR-AIR 3.3 and Meta Quest


LPVR New Release 4.9.2 &#8211; Varjo XR-4 Controller Integration and Key Improvements


Accurate Mixed Reality with LPVR-CAD and Varjo XR-3




## Categories


Blog

Event

Media

Product

Projects

Use Cases


































Order
Company
Blog
Contact



Copyright © 2026 LP-Research. All rights reserved.















## Cookie Consent

We use cookies to improve your experience on our site. By using our site, you consent to cookies.
PreferencesRejectAccept AllPowered by

## This website uses cookies
&times;

Websites store cookies to enhance functionality and personalise your experience. You can manage your preferences, but blocking some cookies may impact site performance and services.
Essential

Essential cookies enable basic functions and are necessary for the proper function of the website.NameDescriptionDurationCookie PreferencesThis cookie is used to store the user's cookie consent preferences.30 daysGoogle reCAPTCHA

Google reCAPTCHA helps protect websites from spam and abuse by verifying user interactions through challenges.NameDescriptionDuration_GRECAPTCHAGoogle reCAPTCHA sets a necessary cookie (_GRECAPTCHA) when executed for the purpose of providing its risk analysis.179 daysStatistics

Statistics cookies collect information anonymously. This information helps us understand how visitors use our website.Google Analytics

Google Analytics is a powerful tool that tracks and analyzes website traffic for informed marketing decisions.

Service URL: policies.google.comNameDescriptionDuration_gac_Contains information related to marketing campaigns of the user. These are shared with Google AdWords / Google Ads when the Google Ads and Google Analytics accounts are linked together.90 days__utmaID used to identify users and sessions2 years after last activity__utmtUsed to monitor number of Google Analytics server requests10 minutes__utmbUsed to distinguish new sessions and visits. This cookie is set when the GA.js javascript library is loaded and there is no existing __utmb cookie. The cookie is updated every time data is sent to the Google Analytics server.30 minutes after last activity__utmcUsed only with old Urchin versions of Google Analytics and not with GA.js. Was used to distinguish between new sessions and visits at the end of a session.End of session (browser)__utmzContains information about the traffic source or campaign that directed user to the website. The cookie is set when the GA.js javascript is loaded and updated when data is sent to the Google Anaytics server6 months after last activity__utmvContains custom information set by the web developer via the _setCustomVar method in Google Analytics. This cookie is updated every time new data is sent to the Google Analytics server.2 years after last activity__utmxUsed to determine whether a user is included in an A / B or Multivariate test.18 months_gaID used to identify users2 years_galiUsed by Google Analytics to determine which links on a page are being clicked30 seconds_ga_ID used to identify users2 years_gidID used to identify users for 24 hours after last activity24 hours_gatUsed to monitor number of Google Analytics server requests when using Google Tag Manager1 minuteMarketing

Marketing cookies are used to follow visitors to websites. The intention is to show ads that are relevant and engaging to the individual user.Google Maps

Google Maps is a web mapping service providing satellite imagery, real-time navigation, and location-based information.

Service URL: policies.google.comNameDescriptionDurationOGPCThese cookies are used by Google to store user preferences and information while viewing Google mapped pages.1 monthOGPThis cookie is used by Google to activate and track the Google Maps functionality.2 monthsAccept AllCloseSave and ClosePowered by




