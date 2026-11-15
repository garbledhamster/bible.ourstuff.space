---
name: auto-grill
description: Use during human Grilling or Grill with Docs, when the user asks for agent-to-agent grilling, or when they revisit a recorded question from an agent interview.
---

# Auto Grill

Keep interviewing the human until they choose to hand the remaining design decisions to agents. The handoff authorizes the interview and its decision record within the agreed scope.

## Record the whole interview

Keep one reviewable record across human and agent rounds, including decisions made before the switch. Record who chose the handoff and how they chose it. For each question, keep a stable number, the chapter or topic, who asked it, the recommendation and who made it, each substantive answer and who gave it, and the current decision, reason and status. Record an accepted recommendation as the person's answer and keep the recommendation visible. Keep follow-up answers alongside the earlier ones and mark what they replace. Attribute recommendations, answers and approvals to the people or agents who actually gave them. Mark missing information or pending owner review in the record.

The user can join the interview, take it back, or revisit any question during or after agent rounds. Use the existing question number and show the recorded answers. Discuss the options with the user and use the human pop-out for decisions that need their answer. Record a clear answer the user has already given in chat as their answer. Add it under their name, preserve the earlier responses, and update the current decision and affected chapters or tasks if it changes. If the user takes over, resume human rounds for the remaining scope.

## Offer the switch

Use Grilling or Grill with Docs for human rounds when available. Use the native pop-out questionnaire to ask each decision question and offer the switch. Put the recommendation first, label it **(Recommended)** and give realistic choices. If the pop-out is unavailable, tell the user and leave the question pending. Present it when the pop-out becomes available.

Count consecutive, explicitly accepted recommendations within the same grilling session. Count each answered decision once, in question order, including across a continuation with the same scope. A different substantive answer resets the streak. A preselection, skip, timeout, ambiguous reply or unconfirmed default adds nothing. Use the answers you can verify and retain the count and any pending or declined offer when handing off.

When a round ends with at least 20 consecutive accepted recommendations, or the threshold the user chose, offer the switch before the next design round. Deliver one offer per session. For example, ask whether they want a separate informed interviewer to grill the acting agent through the remaining chapters and return the decisions for review. Offer **Switch to agent grilling (Recommended)** and **Keep grilling me**. Wait for their answer. An explicit yes starts agent grilling. A decline keeps human rounds going without another offer in that session. Silence or ambiguity leaves the offer pending. A direct request to have agents finish the interview gives consent at any count, including after a decline.

## Run the agent interview

1. Read the project or design record, active scope, settled decisions and open questions. Give them to a separate collaboration subagent with the relevant sources and Grilling or Grill with Docs instructions. The interviewer reads the evidence and asks numbered questions with a recommendation and distinct choices over collaboration. The acting agent answers and records decisions. If a separate interviewer is unavailable, tell the user and leave that handoff pending.
2. Continue in rounds through the agreed scope. Ask questions whose prerequisites are settled, answer with a choice and reason, and use the answer to find the next open decisions. Preserve earlier approvals and attribute new choices to the acting agent. Keep decisions that require the owner's authority open and continue independent branches. If a human decision is essential before another branch can proceed, ask for it in the pop-out.
3. Close when the interviewer confirms the remaining design questions are covered or names the decisions still awaiting the owner. Verify the complete interview record and add any expected checks and the next action. For Project Bible, keep the Work mode in Grilling and link the verified reader, the complete interview record and relevant chapters for owner review. The record distinguishes proposed checks from evidence of checks already run. Implementation and mode changes follow the user's existing authorization.
