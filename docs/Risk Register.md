

# 

# **BigCommerce Plugin for ChessWorld SKU Management**

 		**Risk Register**	  
Version 4.0

**Written by:**  
Rui En Koe  
Alex Chan  
Ashley Warden  
Liangdi Wang  
Luqmaan Yurzaa  
Wen Cheng Huong 

# 	

# **Document History and Version Control**

| Date (dd/mm/yy) | Version | Author | Description |
| :---- | :---- | :---- | :---- |
| 24/03/2025 | 1.0 |  Rui En Koe | Initial Risk Register for Milestone 1 |
| 14/05/2025 | 2.0 | Rui En Koe Wen Cheng Huong | Risks identified and updated for Milestone 2 |
| 15/05/2025 | 2.0 | Rui En Koe  | Risk register review for Milestone 2 |
| 18/05/2025 | 2.0 | Wen Cheng Huong | Updated risks occurred and mitigated in milestone 2 |
| 31/08/2025 | 3.0 | Rui En Koe | Risk identified and updated for Milestone 3 |
| 06/10/2025 | 4.0 | Wen Cheng Huong | Risk identified and updated for Milestone 4 Updated risks occurred and mitigated in milestone 3 |
| 27/10/2025 | 4.0 | Rui En Koe  | Updated New Risk Identified for Milestone 3  |

# **Contents**

[**1\. Introduction	4**](#1.-introduction)

[**2\. Risk Rating Matrix	5**](#2.-risk-rating-matrix)

[**3\. Initial Risk Register as of Milestone 1	6**](#3.-initial-risk-register-as-of-milestone-1)

[**4\. New Risk Identified	12**](#4.-new-risk-identified)

[4.1 Milestone 2	12](#4.1-milestone-2)

[4.2 Milestone 3	16](#4.2-milestone-3)

[4.3 Milestone 4	18](#4.3-milestone-4)

[**5\. Updated Risk Register	20**](#5.-updated-risk-register)

[**6\. Risk Register Review	29**](#6.-risk-register-review)

[6.1 Risks Occurred and Dealt by Team Members During Milestone 2 (14/04/2025 \-30/05/2025)	29](#6.1-risks-occurred-and-dealt-by-team-members-during-milestone-2-\(14/04/2025--30/05/2025\))

[6.2 Risks Occurred and Dealt by Team Members During Milestone 3 (28/07/2025 \-07/09/2025)	31](#6.2-risks-occurred-and-dealt-by-team-members-during-milestone-3-\(28/07/2025--07/09/2025\))

# **1\. Introduction** {#1.-introduction}

Risk management consists of five key phases:

1. **Risk Identification**: Identify potential risks that could impact the project's outcome.

2. **Risk Analysis**: Assess and prioritize risks based on their likelihood of occurring and the severity of their potential impact.

3. **Risk Response Planning**: Develop strategies and action plans to mitigate the threats posed by specific risks to project objectives.

4. **Risk Monitoring and Control**: Continuously monitor, analyse, and reassess risks. This phase ensures that previously identified risks are tracked and managed effectively, while newly identified risks are addressed. It involves verifying the effectiveness of planned risk responses and keeping the project team updated on risk status.

5. **Risk Mitigation**: Focuses on minimizing the likelihood or impact of risks through proactive strategies, including:  
   * **Avoidance**: Eliminating the risk by changing plans, processes, or objectives.  
   * **Reduction**: Implementing measures to reduce the likelihood or impact of the risk.  
   * **Transfer**: Shifting the risk to a third party better equipped to handle it.  
   * **Acceptance**: Acknowledging the risk and accepting it when the cost of mitigation exceeds the cost of facing the risk.

# 

# **2\. Risk Rating Matrix**  {#2.-risk-rating-matrix}

The below risk matrix will be used to fill the risk ratings.

| *RISK RATING  KEY* | LOW | MEDIUM | HIGH | EXTREME |
| ----- | :---: | :---: | :---: | :---: |
|  | **0 – ACCEPTABLE** | **1 – ALARM** as low as reasonably practicable | **2 – GENERALLY UNACCEPTABLE** | **3 – INTOLERABLE** |
|  | **––––––––––––––––––   OK TO PROCEED** | **––––––––––––––––––  TAKE MITIGATION EFFORTS** | **––––––––––––––––––  SEEK SUPPORT** | **––––––––––––––––––  PLACE EVENT ON HOLD** |
|  |  |  |  |  |
| ***RISK MATRIX*** | **ACCEPTABLE** | **TOLERABLE** | **UNDESIRABLE** | **INTOLERABLE** |
|  | **LITTLE TO NO EFFECT ON EVENT** | **EFFECTS ARE FELT, BUT NOT CRITICAL TO OUTCOME** | **SERIOUS IMPACT TO THE COURSE OF ACTION AND OUTCOME** | **COULD RESULT IN DISASTER** |
| **IMPROBABLE** | **LOW** | **MEDIUM** | **MEDIUM** | **HIGH** |
| **RISK IS UNLIKELY TO OCCUR** | **– 1 –** | **– 4 –** | **– 6 –** | **– 10 –** |
| **POSSIBLE** | **LOW** | **MEDIUM** | **HIGH** | **EXTREME** |
| **RISK WILL LIKELY OCCUR** | **– 2 –** | **– 5 –** | **– 8 –** | **– 11 –** |
| **PROBABLE** | **MEDIUM** | **HIGH** | **HIGH** | **EXTREME** |
| **RISK WILL OCCUR** | **– 3 –** | **– 7 –** | **– 9 –** | **– 12 –** |

# **3\. Initial Risk Register as of Milestone 1** {#3.-initial-risk-register-as-of-milestone-1}

| Risk ID | Description | Likelihood of the risk occurring  | Impact if the risk occurs | Risk Rating  | Impact on Project | Monitoring Strategy | Mitigation Plan | Person Responsible |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| Technical Risks |  |  |  |  |  |  |  |  |
| R01 | Inadequate programming language proficiency | Possible | Intolerable | 11 | The progress of the project may be halted due to project members requiring more time to write the code and troubleshoot issues.  | Regular skill assessment tests will be conducted to gauge the programmer's language proficiency. | Pair programming sessions and regular code reviews will ensure collaborative learning and error detection. | Scrum Team  |
| R02 | Insufficient testing coverage for the software | Possible  | Undesirable | 8 | It may result in potential failures in the software system due to the likelihood of undetected defects. | Develop comprehensive testing plans and test cases to achieve full coverage  | Enhance testing endeavours, conduct reviewing on the test cases, and introduce automation to streamline testing processes eg. CI/CD pipeline, thereby boosting testing efficiency. | QA Tester |
| R03 | Data breaches | Possible  | Intolerable  | 11 | It can cause severe consequences like gaining access to user information and damaging brand reputation. Eventually it will cost the trust of stakeholders. | Ensure that detailed logs of who accessed what data and when is being tracked to ensure that the data access is monitored and data leak is prevented. | Implement encryption, penetration testing, and security patches to identify any gaps or weaknesses in the system.  | Scrum Team |
| R04 | Plugin performance issues | Possible  | Acceptable | 2 | Poor plugin performance can degrade the user experience, leading to frustration, dissatisfaction, and reduced user engagement. | Conduct regular performance testing by incorporating RUM tools like Google Analytics and performance monitoring tools like GTmetrix to monitor real user interactions with the application. | Optimization and proper system architecture. | Scrum Team |
| R05 | Integration challenges | Possible  | Intolerable  | 12 | Each team member needs to tackle and resolve issues leading to uncertainty regarding the project's completion timeline. | Conduct routine integration testing and implement continuous integration to detect issues early on. | Establish an extensive integration test environment to replicate various integration scenarios. | Scrum Team |
| R06 | Server or hosting downtime on GitHub | Possible  | Acceptable | 1 | May cause disruptions and delay in project work.  | Perform routine server health checks to monitor both the stability and performance of the server. | Establish a backup server and implement regular data synchronisation to a secure hosting environment for backups. | Scrum Team |
| Requirements and Scope Risks |  |  |  |  |  |  |  |  |
| R07 | Scope creep causing delays | Possible | Undesirable | 8 | Delays in project timelines can result in missed deadlines, and reduced stakeholder satisfaction. | Regular project status meetings | Clearly outlined change management processes | Project Manager |
| R08 | Scope misalignment with user needs | Possible | Intolerable | 11 | The final product will not meet the client’s expectation, leading to dissatisfaction among them. This may require extensive iterations to realign the scope with user needs. | Conduct regular user feedback sessions and usability testing to ensure ongoing project alignment with user expectations. | Engage users in requirement refinement actively and prioritise user acceptance testing to validate the software against user requirements. | Project Manager |
| R09 | Requirements specification incomplete or unclear  | Possible | Intolerable | 11 | Failing to meet stakeholders’ expectations impacts the project success, resulting in trust from stakeholders.  | Weekly requirement reviews for clarity with stakeholders. Sprint reviews to assess work against initial requirements. | Engage users in requirement refinement actively and prioritise user acceptance testing to validate the software against user requirements. | Project Manager |
| Team and Process Risks |  |  |  |  |  |  |  |  |
| R10 | Technical debt due to rushed development | Possible | Tolerable | 5 | Rushed development leads to low code quality, resulting in higher likelihood of bugs and errors within the project.  | Conduct code quality reviews frequently. | Regular refactoring and tech debt management integrated into sprints. | Scrum Team |
| R11 | Lack of version control discipline  | Probable | Extreme | 12 | It may result in merge conflicts when any team wants to merge sub-branch to main branch.  | Regular code reviews and pull requests, enforce everyone to provide a clear commit message. | Establish version control practices and a code branching strategy to avoid overwritten code and facilitate collaboration. | Scrum Team |
| R12 | Team unfamiliar with Scrum framework leading to process mistakes | Probable | Tolerable | 7 | This may cause miscommunication within the team, resulting in misalignment of their deliverables with the sprint goals.  | Regular stand-up meetings. | Referring back to lecture/workshop slides or research online whenever in doubt.  | Scrum Master |
| R13 | Uneven work distribution  | Possible | Tolerable | 5 | That team member feels unfairly treated and may give up on their tasks, slowing down the project's progress and causing burnout among the rest of the team members. | If there is uneven work distribution, it should be detected as soon as possible. It should be visible by observing the task list for each team member. Therefore, if there's an obvious difference between each other, there is an uneven work distribution.  | Weekly discussion on the topics or project that has to be done and make sure everyone is satisfied with their workload. | Scrum Team |
| R14 | Team member leaving the unit/course | Improbable | Undesirable | 6 | There will be a decrease in the number of project members. This will slow down the progression of the project as the items in iteration and PI planning may be reduced to alleviate the burden on the remaining members. | Ensure that every team member contributes to creating a positive and conducive learning environment to the best of their ability | Thoroughly documenting each team member's work will help safeguard the project's progress in case a member departs. | Scrum Team |
| R15 | Team member’s  burnout  | Probable  | Intolerable | 12 | Team members' burnout leads to exhaustion, reduced productivity, and disengagement from work, resulting in delays in task completion and overall project progress. | Observe team spirits during meetings and each person should be vigilant in detecting when negative emotions are brought up during conversations as that could be a sign of burnout. | Give support and motivation to team members when members are feeling down or discouraged due to overwhelming load from projects or other units.  | Scrum Master |
| R16 | Ineffective communications or misunderstandings among team members | Possible | Tolerable | 5 | May cause unnecessary delays and disrupt the project plan. | Regularly monitor team interactions, both formal and informal, for signs of miscommunication or confusion. | Establish clear communication protocols, encourage active listening and have some team-building activities | Scrum Master |
| R17 | Disagreements could happen within the team regarding a requirement | Possible  | Undesirable | 8 |  It may result in a divergence from the project's objectives, affecting the timeline and the quality of the deliverables. | Encourage all team members to share their opinion as formally as possible so that it stays constructive. | Document all the requirements thoroughly and make  sure they align with the project. occasionally revisit the document to make changes if any.  | Scrum Master |
| R18 | Unable to meet the deadline of milestones | Improbable  | Tolerable  | 4 | It may lead to project delays and can cause a disruption in stakeholders plans.  | Regularly track overall progress using project management tools and send reminders to the group about the deadlines. | Set realistic deadlines. Break down tasks into small and manageable components. | Scrum Team |
| R19 | Fluctuations in the motivation of the team members’  | Possible  | Undesirable  | 8 | It can lead to inconsistent productivity and eventually miss deadlines. | Have regular checkups on team determination through meetings. Monitor individual progress of each team member and look for signs. | Ensure the work environment stays positive and the team members support each other. | Scrum Master |
| Data Privacy, Legal and Licensing Risks |  |  |  |  |  |  |  |  |
| R20 | Data loss or corruption | Possible | Intolerable | 11 | Potential loss of data will disrupt project workflows and increase risk of rework.  | Perform regular backups | Implement automatic backups and disaster recovery plans. | Scrum Team |
| R21 | Licensing issues for tools/ frameworks used | Improbable | Intolerable | 10 | This can lead to legal liabilities and thus slow down the project due to restricted use of certain tools or frameworks.  | Perform periodic audits on the project’s dependencies and licences to ensure ongoing compliance. | Establish a clear licence policy that outlines acceptable and unacceptable licences for tools and frameworks used in the project.  | Scrum Team |
| R22 | Data ethics and privacy violations | Probable | Intolerable | 12 | Loss of stakeholders’ trust and confidence  | Conduct regular data privacy assessments to identify potential vulnerabilities in the data handling process. Implement monitoring for any unusual data access patterns or security breaches. | Implement strong data encryption, establish access controls and user authentication. Ensure data protection regulations. Collaborate with legal counsel to ensure compliance with data protection laws and regulations.  | Scrum Team |

*Table 1: Risk Register*

# **4\. New Risk Identified**  {#4.-new-risk-identified}

## **4.1 Milestone 2** {#4.1-milestone-2}

| Risk ID | Description | Likelihood of the risk occurring  | Impact if the risk occurs | Risk Rating  | Impact on Project | Monitoring Strategy | Mitigation Plan | Person Responsible |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| Technical Risks |  |  |  |  |  |  |  |  |
| R07 | Poor integration between the plugin app and BigCommerce's existing platform page | Possible  | Intolerable  | 11 | Poor integration between the plugin app and BigCommerce’s existing platform pages may lead to client dissatisfaction and failure to meet client expectations | Monitor integration performance and plugin errors using logging tools and user feedback | Explore alternative approaches to building the SKU plugin within the existing BigCommerce platform, or engage in discussions with the client to align on the best path forward | Scrum Team |
| R08 | Error with stock calculation and management. (Inventory Synchronisation Issues) | Possible | Intolerable | 11 | Stock management issues could lead to overselling and loss of customer trust. | Automated testing should be executed for every commit to catch any potential errors. | Automated testing should be implemented for stock tracking and management. | Scrum Team |
| R09 | Poor UI/UX integration leading to difficulties in operating the plugin | Possible | Tolerable | 5 | If the bundle management UI is confusing or hard to use, clients may not adopt the product. | Keep clients involved in the UI/UX designing, and seek regular feedbacks. | Work closely with client feedback, and follow BigCommerce design standards. | Scrum Team |
| R11 | Conflict with other plugins or external apps on the BigCommerce Platform | Improbable | Undesirable | 6 | Plugin interfering with other plugins may cause errors in workflow, leading to undesirable results. | Keep clients informed and seek information on what other potential plugins will the clients use in their workflow. | Use scoped app permissions and avoid making assumptions about how other plugins manage data. | Scrum Team |
| R12 | Lack of robust error handling. | Possible | Undesirable | 8 | Failing silently or crashing on error will create a poor experience and may cause business or workflow disruptions. | Automated testing should be executed for every commit to catch any potential loopholes in error handling. | Build strong logging, alerting, and error recovery mechanisms. | Scrum Team |
| R13 | Support and product maintenance overhead | Improbable | Tolerable | 4 | Once in production, clients may need maintenance or updates to the product. | Monitor for issues and keep updating the documentations. | Provide clear documentations on the implementation and maintenance of the product. | Scrum Team |
| Requirements and Scope Risks |  |  |  |  |  |  |  |  |
| R17 | Undefined project scope | Improbable  | Tolerable  | 4 | Unclear project deliverables leading to misunderstandings and missed deadlines. | Regularly review and update the project scope document. | Define and document the project scope clearly at the beginning, and make sure the entire team is understood. | Project Manager and Product Owner |
| R18 | Overly ambitious scope | Improbable  | Acceptable  | 1 | Failure in delivering on time and may cause burnout.  | Monitor the project milestones | Break down the project into manageable phases, and prioritise features. | Project Manager and Product Owner |
| R19 | Changing requirements | Probable  | Undesirable  | 9 | Delay in project timeline and potential burnout of the developers. | Keep a track of requirement changes and monitor their impact on project scope and timelines. | Implement a change control process. | Project Manager and Product Owner |
| Team and Process Risks |  |  |  |  |  |  |  |  |
| R30 | Overloaded team members with assignments | Improbable  | Tolerable  | 4 | Team members with many assignments due in the same week are burnt out and have a reduced quality of work. | Track workloads and monitor for signs of stress or burnout. | Provide support and resources. Balance the workload. | Scrum Master  |
| Project-related Risks  |  |  |  |  |  |  |  |  |
| R31 | BigCommerce platform limitation | Probable  | Undesirable | 9 | Platform limitation causes developers to fail to meet all requirements, leading to client’s dissatisfaction. | Deeply review BigCommerce documentation and limitations during the planning phase. | Present potential compromises and alternatives with clear rationale. Share prototypes or demos for early feedback. | Scrum Team  |
| R32 | Working on BigCommerce free-trial store environment  | Probable  | Undesirable | 9 | Team members are unable to access the trial store created in the BigCommerce Developer Portal after the trial period expires, which may cause delays in the project timeline if an alternative development environment is not secured in time. | Conduct regular communication with the client and academic supervisor to monitor the issue and track the trial store’s expiration in order to migrate work or request an extension in advance. | Request access to a BigCommerce sandbox or developer store through the client’s account, and continue project development within the same environment to ensure consistency. | Scrum Team  |
| R33 | Limited Testing in Sandbox Environments | Improbable | Tolerable | 4 | The BigCommerce sandbox environment may not fully replicate live behavior, making it difficult for developers to identify bugs or errors during internal testing (e.g., unit and integration tests). | Conduct regular unit and integration testing throughout the development process. | Populate the sandbox with realistic and diverse test data to mimic real-world scenarios as closely as possible.  | Scrum Team  |

*Table 2: New Risks Identified During Milestone 2*

## **4.2 Milestone 3** {#4.2-milestone-3}

| Risk ID | Description | Likelihood of the risk occurring  | Impact if the risk occurs | Risk Rating  | Impact on Project | Monitoring Strategy | Mitigation Plan | Person Responsible |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| Team and Process Risks |  |  |  |  |  |  |  |  |
| R31 | Unable to meet the deadline of milestones | Improbable  | Tolerable  | 4 | It may lead to project delays and can cause a disruption in stakeholders plans.  | Regularly track overall progress using project management tools and send reminders to the group about the deadlines. | Set realistic deadlines. Break down tasks into small and manageable components. | Scrum Team |
| R32 | Fluctuations in the motivation of the team members’  | Possible  | Undesirable  | 8 | It can lead to inconsistent productivity and eventually miss deadlines. | Have regular checkups on team determination through meetings. Monitor individual progress of each team member and look for signs. | Ensure the work environment stays positive and the team members support each other. | Scrum Master |
| R33 | Overloaded team members with assignments | Improbable  | Tolerable  | 4 | Team members with many assignments due in the same week are burnt out and have a reduced quality of work. | Track workloads and monitor for signs of stress or burnout. | Provide support and resources. Balance the workload. | Scrum Master  |
| R34 | Scheduling conflicts and clashes risk  | Possible | Tolerable | 5 | Delays in task completion leading to missed milestones. | Clear communication protocols to coordinate team availability and workload. | Establish a project calendar with milestones and critical paths clearly defined. | Scrum Team |
| R35 | Team member’s health risk | Possible  | Tolerable | 5 | Reduced team capacity impacting workload distribution and productivity, leading to delays in task completion.  | Cross-train team members to handle multiple roles in case of absence. | Develop a backup resource pool for critical roles and tasks. | Scrum Team  |

 *Table 3: New Risks Identified During Milestone 3*

## **4.3 Milestone 4** {#4.3-milestone-4}

| Risk ID | Description | Likelihood of the risk occurring  | Impact if the risk occurs | Risk Rating  | Impact on Project | Monitoring Strategy | Mitigation Plan | Person Responsible |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| Technical Risks |  |  |  |  |  |  |  |  |
| R14 | Unexpected critical bugs discovered late in testing. | Possible | Intolerable | 11 | Project delay due to additional debugging cycles; quality issues may exist in final product | Conduct frequent rounds of extensive UAT and E2E Testing. | Allocate buffer for fixes; prioritize critical issues. | Scrum Team |
| R15 | Critical failures in deployment | Possible | Intolerable | 11 | Potential product downtime, causing missed deadlines or issues in stock management. | Monitoring deployment logs. | Implement rollback plan; rehearse deployment in staging. | Scrum Team |
| R16 | Further performance degradation after optimization changes | Improbable | Tolerable | 4 | Poor user experience and possible dissatisfaction. May cause project delay. | Track performance metrics. | Benchmark before and after optimizations; adjust tuning. | Scrum Team |
| Requirement and Scope Risks |  |  |  |  |  |  |  |  |
| R23 | Handover acceptance requirements unclear or disputed | Improbable | Tolerable | 4 | Misalignment on deliverables, causing potential delay in project closure | Confirm requirements and handover checklists with clients during meetings. | Formalize acceptance criteria early and possibly sign off with client | Scrum Team |
| Team and Process Risks |  |  |  |  |  |  |  |  |
| R37 | Incomplete documentation or knowledge transfer for handover | Possible | Undesirable | 8 | Delays in handover; reduced maintainability and post-deployment support issues | Conduct documentation reviews and handover readiness meetings | Documentation lead to create detailed handover checklist and ensure updated documentations | Scrum Team |
| R38 | Delays in UAT | Possible | Tolerable | 5 | Project completion delayed; final sign-off postponed | Track UAT progress and stakeholder response times via the UAT registry | Schedule UAT early and maintain open communication | Scrum Team |

 *Table 4: New Risks Identified During Milestone 4*

# **5\. Updated Risk Register**  {#5.-updated-risk-register}

Below is our updated Risk Register, where all the newly identified risks have been added into our current Risk Register.  
The newly identified risks have been highlighted for easier identification.  
The Risk IDs have been updated to accommodate the addition of new risks.

| Risk ID | Description | Likelihood of the risk occurring  | Impact if the risk occurs | Risk Rating  | Impact on Project | Monitoring Strategy | Mitigation Plan | Person Responsible |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| Technical Risks |  |  |  |  |  |  |  |  |
| R01 | Inadequate programming language proficiency | Possible | Intolerable | 11 | The progress of the project may be halted due to project members requiring more time to write the code and troubleshoot issues.  | Regular skill assessment tests will be conducted to gauge the programmer's language proficiency. | Pair programming sessions and regular code reviews will ensure collaborative learning and error detection. | Scrum Team  |
| R02 | Insufficient testing coverage for the software | Possible  | Undesirable | 8 | It may result in potential failures in the software system due to the likelihood of undetected defects. | Develop comprehensive testing plans and test cases to achieve full coverage  | Enhance testing endeavours, conduct reviewing on the test cases, and introduce automation to streamline testing processes eg. CI/CD pipeline, thereby boosting testing efficiency. | QA Tester |
| R03 | Data breaches | Possible  | Intolerable  | 11 | It can cause severe consequences like gaining access to user information and damaging brand reputation. Eventually it will cost the trust of stakeholders. | Ensure that detailed logs of who accessed what data and when is being tracked to ensure that the data access is monitored and data leak is prevented. | Implement encryption, penetration testing, and security patches to identify any gaps or weaknesses in the system.  | Scrum Team |
| R04 | Plugin performance issues | Possible  | Acceptable | 2 | Poor plugin performance can degrade the user experience, leading to frustration, dissatisfaction, and reduced user engagement. | Conduct regular performance testing by incorporating RUM tools like Google Analytics and performance monitoring tools like GTmetrix to monitor real user interactions with the application. | Optimization and proper system architecture. | Scrum Team |
| R05 | Integration challenges | Possible  | Intolerable  | 12 | Each team member needs to tackle and resolve issues leading to uncertainty regarding the project's completion timeline. | Conduct routine integration testing and implement continuous integration to detect issues early on. | Establish an extensive integration test environment to replicate various integration scenarios. | Scrum Team |
| R06 | Server or hosting downtime on GitHub | Possible  | Acceptable | 1 | May cause disruptions and delay in project work.  | Perform routine server health checks to monitor both the stability and performance of the server. | Establish a backup server and implement regular data synchronisation to a secure hosting environment for backups. | Scrum Team |
| R07 | Poor integration between the plugin app and BigCommerce's existing platform page | Possible  | Intolerable  | 11 | Poor integration between the plugin app and BigCommerce’s existing platform pages may lead to client dissatisfaction and failure to meet client expectations | Monitor integration performance and plugin errors using logging tools and user feedback | Explore alternative approaches to building the SKU plugin within the existing BigCommerce platform, or engage in discussions with the client to align on the best path forward | Scrum Team |
| R08 | Error with stock calculation and management. (Inventory Synchronisation Issues) | Possible | Intolerable | 11 | Stock management issues could lead to overselling and loss of customer trust. | Automated testing should be executed for every commit to catch any potential errors. | Automated testing should be implemented for stock tracking and management. | Scrum Team |
| R09 | Poor UI/UX integration leading to difficulties in operating the plugin | Possible | Tolerable | 5 | If the bundle management UI is confusing or hard to use, clients may not adopt the product. | Keep clients involved in the UI/UX designing, and seek regular feedbacks. | Work closely with client feedback, and follow BigCommerce design standards. | Scrum Team |
| R10 | Conflict with other plugins or external apps on the BigCommerce Platform | Improbable | Undesirable | 6 | Plugin interfering with other plugins may cause errors in workflow, leading to undesirable results. | Keep clients informed and seek information on what other potential plugins will the clients use in their workflow. | Use scoped app permissions and avoid making assumptions about how other plugins manage data. | Scrum Team |
| R11 | Lack of robust error handling. | Possible | Undesirable | 8 | Failing silently or crashing on error will create a poor experience and may cause business or workflow disruptions. | Automated testing should be executed for every commit to catch any potential loopholes in error handling. | Build strong logging, alerting, and error recovery mechanisms. | Scrum Team |
| R12 | Support and product maintenance overhead | Improbable | Tolerable | 4 | Once in production, clients may need maintenance or updates to the product. | Monitor for issues and keep updating the documentations. | Provide clear documentations on the implementation and maintenance of the product. | Scrum Team |
| R13 | Unexpected critical bugs discovered late in testing. | Possible | Intolerable | 11 | Project delay due to additional debugging cycles; quality issues may exist in final product | Conduct frequent rounds of extensive UAT and E2E Testing. | Allocate buffer for fixes; prioritize critical issues. | Scrum Team |
| R14 | Critical failures in deployment | Possible | Intolerable | 11 | Potential product downtime, causing missed deadlines or issues in stock management. | Monitoring deployment logs. | Implement rollback plan; rehearse deployment in staging. | Scrum Team |
| R15 | Further performance degradation after optimization changes | Improbable | Tolerable | 4 | Poor user experience and possible dissatisfaction. May cause project delay. | Track performance metrics. | Benchmark before and after optimizations; adjust tuning. | Scrum Team |
| Requirements and Scope Risks |  |  |  |  |  |  |  |  |
| R16 | Scope creep causing delays | Possible | Undesirable | 8 | Delays in project timelines can result in missed deadlines, and reduced stakeholder satisfaction. | Regular project status meetings | Clearly outlined change management processes | Project Manager |
| R17 | Scope misalignment with user needs | Possible | Intolerable | 11 | The final product will not meet the client’s expectation, leading to dissatisfaction among them. This may require extensive iterations to realign the scope with user needs. | Conduct regular user feedback sessions and usability testing to ensure ongoing project alignment with user expectations. | Engage users in requirement refinement actively and prioritise user acceptance testing to validate the software against user requirements. | Project Manager |
| R18 | Requirements specification incomplete or unclear  | Possible | Intolerable | 11 | Failing to meet stakeholders’ expectations impacts the project success, resulting in trust from stakeholders.  | Weekly requirement reviews for clarity with stakeholders. Sprint reviews to assess work against initial requirements. | Engage users in requirement refinement actively and prioritise user acceptance testing to validate the software against user requirements. | Project Manager |
| R19 | Undefined project scope | Improbable  | Tolerable  | 4 | Unclear project deliverables leading to misunderstandings and missed deadlines. | Regularly review and update the project scope document. | Define and document the project scope clearly at the beginning, and make sure the entire team is understood. | Project Manager and Product Owner |
| R20 | Overly ambitious scope | Improbable  | Acceptable  | 1 | Failure in delivering on time and may cause burnout.  | Monitor the project milestones | Break down the project into manageable phases, and prioritise features. | Project Manager and Product Owner |
| R21 | Changing requirements | Probable  | Undesirable  | 9 | Delay in project timeline and potential burnout of the developers. | Keep a track of requirement changes and monitor their impact on project scope and timelines. | Implement a change control process. | Project Manager and Product Owner |
| R22 | Handover acceptance requirements unclear or disputed | Improbable | Tolerable | 4 | Misalignment on deliverables, causing potential delay in project closure | Confirm requirements and handover checklists with clients during meetings. | Formalize acceptance criteria early and possibly sign off with client | Scrum Team |
| Team and Process Risks |  |  |  |  |  |  |  |  |
| R23 | Technical debt due to rushed development | Possible | Tolerable | 5 | Rushed development leads to low code quality, resulting in higher likelihood of bugs and errors within the project.  | Conduct code quality reviews frequently. | Regular refactoring and tech debt management integrated into sprints. | Scrum Team |
| R24 | Lack of version control discipline  | Probable | Extreme | 12 | It may result in merge conflicts when any team wants to merge sub-branch to main branch.  | Regular code reviews and pull requests, enforce everyone to provide a clear commit message. | Establish version control practices and a code branching strategy to avoid overwritten code and facilitate collaboration. | Scrum Team |
| R25 | Team unfamiliar with Scrum framework leading to process mistakes | Probable | Tolerable | 7 | This may cause miscommunication within the team, resulting in misalignment of their deliverables with the sprint goals.  | Regular stand-up meetings. | Referring back to lecture/workshop slides or research online whenever in doubt.  | Scrum Master |
| R26 | Uneven work distribution  | Possible | Tolerable | 5 | That team member feels unfairly treated and may give up on their tasks, slowing down the project's progress and causing burnout among the rest of the team members. | If there is uneven work distribution, it should be detected as soon as possible. It should be visible by observing the task list for each team member. Therefore, if there's an obvious difference between each other, there is an uneven work distribution.  | Weekly discussion on the topics or project that has to be done and make sure everyone is satisfied with their workload. | Scrum Team |
| R27 | Team member leaving the unit/course | Improbable | Undesirable | 6 | There will be a decrease in the number of project members. This will slow down the progression of the project as the items in iteration and PI planning may be reduced to alleviate the burden on the remaining members. | Ensure that every team member contributes to creating a positive and conducive learning environment to the best of their ability | Thoroughly documenting each team member's work will help safeguard the project's progress in case a member departs. | Scrum Team |
| R28 | Team member’s  burnout  | Probable  | Intolerable | 12 | Team members' burnout leads to exhaustion, reduced productivity, and disengagement from work, resulting in delays in task completion and overall project progress. | Observe team spirits during meetings and each person should be vigilant in detecting when negative emotions are brought up during conversations as that could be a sign of burnout. | Give support and motivation to team members when members are feeling down or discouraged due to overwhelming load from projects or other units.  | Scrum Master |
| R29 | Ineffective communications or misunderstandings among team members | Possible | Tolerable | 5 | May cause unnecessary delays and disrupt the project plan. | Regularly monitor team interactions, both formal and informal, for signs of miscommunication or confusion. | Establish clear communication protocols, encourage active listening and have some team-building activities | Scrum Master |
| R30 | Disagreements could happen within the team regarding a requirement | Possible  | Undesirable | 8 |  It may result in a divergence from the project's objectives, affecting the timeline and the quality of the deliverables. | Encourage all team members to share their opinion as formally as possible so that it stays constructive. | Document all the requirements thoroughly and make  sure they align with the project. occasionally revisit the document to make changes if any.  | Scrum Master |
| R31 | Unable to meet the deadline of milestones | Improbable  | Tolerable  | 4 | It may lead to project delays and can cause a disruption in stakeholders plans.  | Regularly track overall progress using project management tools and send reminders to the group about the deadlines. | Set realistic deadlines. Break down tasks into small and manageable components. | Scrum Team |
| R32 | Fluctuations in the motivation of the team members’  | Possible  | Undesirable  | 8 | It can lead to inconsistent productivity and eventually miss deadlines. | Have regular checkups on team determination through meetings. Monitor individual progress of each team member and look for signs. | Ensure the work environment stays positive and the team members support each other. | Scrum Master |
| R33 | Overloaded team members with assignments | Improbable  | Tolerable  | 4 | Team members with many assignments due in the same week are burnt out and have a reduced quality of work. | Track workloads and monitor for signs of stress or burnout. | Provide support and resources. Balance the workload. | Scrum Master  |
| R34 | Scheduling conflicts and clashes risk  | Possible | Tolerable | 5 | Delays in task completion leading to missed milestones. | Clear communication protocols to coordinate team availability and workload. | Establish a project calendar with milestones and critical paths clearly defined. | Scrum Team |
| R35 | Team member’s health risk | Possible  | Tolerable | 5 | Reduced team capacity impacting workload distribution and productivity, leading to delays in task completion.  | Cross-train team members to handle multiple roles in case of absence. | Develop a backup resource pool for critical roles and tasks. | Scrum Team  |
| R36 | Incomplete documentation or knowledge transfer for handover | Possible | Undesirable | 8 | Delays in handover; reduced maintainability and post-deployment support issues  | Conduct documentation reviews and handover readiness meetings | Documentation lead to create detailed handover checklist and ensure updated documentations | Scrum Team |
| R37 | Delays in UAT | Possible | Tolerable | 5 | Project completion delayed; final sign-off postponed | Track UAT progress and stakeholder response times via the UAT registry | Schedule UAT early and maintain open communication | Scrum Team |
| Data Privacy, Legal and Licensing Risks |  |  |  |  |  |  |  |  |
| R38 | Data loss or corruption | Possible | Intolerable | 11 | Potential loss of data will disrupt project workflows and increase risk of rework.  | Perform regular backups | Implement automatic backups and disaster recovery plans. | Scrum Team |
| R39 | Licensing issues for tools/ frameworks used | Improbable | Intolerable | 10 | This can lead to legal liabilities and thus slow down the project due to restricted use of certain tools or frameworks.  | Perform periodic audits on the project’s dependencies and licences to ensure ongoing compliance. | Establish a clear licence policy that outlines acceptable and unacceptable licences for tools and frameworks used in the project.  | Scrum Team |
| R40 | Data ethics and privacy violations | Improbable | Intolerable | 10 | Loss of stakeholders’ trust and confidence  | Conduct regular data privacy assessments to identify potential vulnerabilities in the data handling process. Implement monitoring for any unusual data access patterns or security breaches. | Implement strong data encryption, establish access controls and user authentication. Ensure data protection regulations. Collaborate with legal counsel to ensure compliance with data protection laws and regulations.  | Scrum Team |

*Table 4: Updated Risk Register* 

# **6\. Risk Register Review**  {#6.-risk-register-review}

## 6.1 Risks Occurred and Dealt by Team Members During Milestone 2 (14/04/2025 \-30/05/2025) {#6.1-risks-occurred-and-dealt-by-team-members-during-milestone-2-(14/04/2025--30/05/2025)}

| Risk ID | Date raised | Description | Likelihood of the risk occurring  | Impact if the risk occurs | Risk Rating  | Risk Details | Risk Solution | Person Responsible |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| R01 | 14/04/2025 | Inadequate programming language proficiency | Possible | Intolerable | 11 | Team members are inexperienced in developing a plugin and the BigCommerce platform in general, which causes delay in development progress early on. | Official BigCommerce documentations, team discussions, technical setup documentations by proficient team members and AI are all used in learning plugin development and the BigCommerce platform. | Scrum Team |
| R05 | 14/05/2024 | Integration challenges | Possible  | Intolerable  | 12 | Integration based on the client's ideal solution is explored and deemed impossible at the current stage of development due to challenges in plugin integration and platform limitations.  | Time is spent on exploring options and alternatives. Options and alternatives are presented to the clients and an alternative is decided before proceeding. | Scrum Team |
| R11 | 16/5/2024 | Lack of version control discipline  | Probable | Extreme | 12 | Some, but not all commits in this milestone were not following the version control guidelines established in the Quality Assurance Plan. Despite no serious issues found in this milestone, it is for the betterment of our team that we should bring this risk up as it is still likely to happen. | Version control practices are established  and the use of code branching strategy is applied to avoid overwritten code and facilitate collaboration. Regular code reviews and pull requests, along with enforcing clear commit messages when pushing changes to the repository resolved this risk. | Scrum Team |
| R16 | 14/04/2024 | Requirements specification incomplete or unclear  | Possible | Intolerable | 11 | Insufficient clarity in the initial requirements specification at the start of the milestone resulted in the team designing the product in a way that did not align with the client's expectations. | Client feedback was incorporated to revise the requirement specification, which in turn informed updates to all relevant design artefacts. | Scrum Team |

  				  *Table 5: Risks Occurred and Mitigation During Milestone 2*

## 6.2 Risks Occurred and Dealt by Team Members During Milestone 3 (28/07/2025 \-07/09/2025) {#6.2-risks-occurred-and-dealt-by-team-members-during-milestone-3-(28/07/2025--07/09/2025)}

| Risk ID | Date raised | Description | Likelihood of the risk occurring  | Impact if the risk occurs | Risk Rating  | Risk Details | Risk Solution | Person Responsible |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| R34 | 04/08/2025  | Scheduling conflicts and clashes risk  | Possible | Tolerable | 5 | Due to a shift in academic schedule in the new semester, the availability of most team members changed which resulted in there being limited time slots where all members are available for meetings with either the supervisor or the clients. | The team chose to prioritize client meetings, ensuring all members are available during client meetings. Supervisor meetings are scheduled at a time slot where most members are available. For both meetings, minutes are recorded and shared to keep all members updated if a team member could not attend a meeting.  | Scrum Team |
| R08 | 26/09/2025 | Error with stock calculation and management. (Inventory Synchronisation Issues) | Possible | Intolerable | 11 | During a round of UAT, the client identified a case where there will be an issue with stock calculation when performing actions such as editing an order or when an order is refunded. This issue was not identified in any prior testing.  | The team communicated with the client regarding this issue and updated the product, fixing this problem before moving onto another round of UAT. | Scrum Team |
| R04 | 15/09/2025 | Plugin performance issues | Possible  | Acceptable | 2 | The team identified potential performance issues on bundle creation and editing caused by limitations on the platform itself. | The team performed code optimization and communicated with the client clearly about the limitations of the platform and the resulting performance issues. The team ensured that an agreement was reached with the client regarding the acceptable performance of the product. | Scrum Team |

