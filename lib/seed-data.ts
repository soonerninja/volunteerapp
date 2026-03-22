import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Seeds the database with realistic sample data for testing.
 * Designed for a volunteer management nonprofit (like a walk/run charity).
 */
export async function seedSampleData(
  supabase: SupabaseClient,
  orgId: string,
  userId: string
): Promise<{ success: boolean; message: string }> {
  try {
    // ── Skills ──────────────────────────────────────────────
    const skillNames = [
      "CPR/First Aid",
      "Event Setup",
      "Registration",
      "Route Marshal",
      "Water Station",
      "Photography",
      "Social Media",
      "Fundraising",
      "Data Entry",
      "Spanish Speaking",
    ];

    const { data: existingSkills } = await supabase
      .from("skills")
      .select("name")
      .eq("org_id", orgId);
    const existingSkillNames = new Set((existingSkills || []).map((s) => s.name));

    const newSkills = skillNames.filter((n) => !existingSkillNames.has(n));
    if (newSkills.length > 0) {
      await supabase
        .from("skills")
        .insert(newSkills.map((name) => ({ org_id: orgId, name })));
    }

    const { data: allSkills } = await supabase
      .from("skills")
      .select("id, name")
      .eq("org_id", orgId);
    const skillMap = new Map((allSkills || []).map((s) => [s.name, s.id]));

    // ── Roles ───────────────────────────────────────────────
    const roleNames = [
      "Walk Chair",
      "Board Member",
      "Team Captain",
      "Regional Lead",
      "Volunteer Coordinator",
    ];

    const { data: existingRoles } = await supabase
      .from("roles")
      .select("name")
      .eq("org_id", orgId);
    const existingRoleNames = new Set((existingRoles || []).map((r) => r.name));

    const newRoles = roleNames.filter((n) => !existingRoleNames.has(n));
    if (newRoles.length > 0) {
      await supabase
        .from("roles")
        .insert(newRoles.map((name) => ({ org_id: orgId, name })));
    }

    const { data: allRoles } = await supabase
      .from("roles")
      .select("id, name")
      .eq("org_id", orgId);
    const roleMap = new Map((allRoles || []).map((r) => [r.name, r.id]));

    // ── Committees ──────────────────────────────────────────
    const committeeData = [
      { name: "Event Planning", description: "Plans and coordinates all events and walks" },
      { name: "Fundraising", description: "Manages donation drives, sponsorships, and grants" },
      { name: "Outreach", description: "Community outreach, marketing, and volunteer recruitment" },
      { name: "Training", description: "New volunteer onboarding and skills training" },
    ];

    const { data: existingCommittees } = await supabase
      .from("committees")
      .select("name")
      .eq("org_id", orgId);
    const existingCommitteeNames = new Set((existingCommittees || []).map((c) => c.name));

    const newCommittees = committeeData.filter((c) => !existingCommitteeNames.has(c.name));
    if (newCommittees.length > 0) {
      await supabase
        .from("committees")
        .insert(newCommittees.map((c) => ({ org_id: orgId, ...c })));
    }

    const { data: allCommittees } = await supabase
      .from("committees")
      .select("id, name")
      .eq("org_id", orgId);
    const committeeMap = new Map((allCommittees || []).map((c) => [c.name, c.id]));

    // ── Volunteers ──────────────────────────────────────────
    const volunteerData = [
      { first_name: "Maria", last_name: "Garcia", email: "maria.garcia@example.com", phone: "(405) 555-0101", status: "active", notes: "Very reliable, always early", joined_date: "2024-03-15" },
      { first_name: "James", last_name: "Wilson", email: "james.w@example.com", phone: "(405) 555-0102", status: "active", notes: "Has a truck for hauling supplies", joined_date: "2024-01-10" },
      { first_name: "Sarah", last_name: "Johnson", email: "sarah.j@example.com", phone: "(405) 555-0103", status: "active", notes: null, joined_date: "2024-06-20" },
      { first_name: "Michael", last_name: "Brown", email: "michael.b@example.com", phone: "(405) 555-0104", status: "active", notes: "Bilingual - English/Spanish", joined_date: "2023-11-01" },
      { first_name: "Emily", last_name: "Davis", email: "emily.d@example.com", phone: "(405) 555-0105", status: "active", notes: "Professional photographer", joined_date: "2024-08-05" },
      { first_name: "Robert", last_name: "Martinez", email: "robert.m@example.com", phone: "(405) 555-0106", status: "active", notes: null, joined_date: "2024-02-28" },
      { first_name: "Jennifer", last_name: "Anderson", email: "jennifer.a@example.com", phone: "(405) 555-0107", status: "active", notes: "CPR certified trainer", joined_date: "2023-09-12" },
      { first_name: "David", last_name: "Taylor", email: "david.t@example.com", phone: "(405) 555-0108", status: "on_leave", notes: "On leave until May - medical", joined_date: "2024-04-01" },
      { first_name: "Lisa", last_name: "Thomas", email: "lisa.t@example.com", phone: "(405) 555-0109", status: "active", notes: "Great with social media", joined_date: "2025-01-15" },
      { first_name: "Chris", last_name: "Jackson", email: "chris.j@example.com", phone: "(405) 555-0110", status: "inactive", notes: "Moved out of area", joined_date: "2023-06-01" },
      { first_name: "Amanda", last_name: "White", email: "amanda.w@example.com", phone: "(405) 555-0111", status: "active", notes: null, joined_date: "2025-02-10" },
      { first_name: "Kevin", last_name: "Harris", email: "kevin.h@example.com", phone: "(405) 555-0112", status: "active", notes: "Experienced route marshal", joined_date: "2024-07-22" },
      { first_name: "Rachel", last_name: "Clark", email: "rachel.c@example.com", phone: "(405) 555-0113", status: "active", notes: null, joined_date: "2024-10-30" },
      { first_name: "Daniel", last_name: "Lewis", email: "daniel.l@example.com", phone: "(405) 555-0114", status: "active", notes: "Eagle Scout - great outdoors skills", joined_date: "2024-05-18" },
      { first_name: "Nicole", last_name: "Walker", email: "nicole.w@example.com", phone: "(405) 555-0115", status: "active", notes: null, joined_date: "2025-03-01" },
    ];

    // Check existing volunteers to avoid duplicates (by email)
    const { data: existingVols } = await supabase
      .from("volunteers")
      .select("email")
      .eq("org_id", orgId);
    const existingEmails = new Set((existingVols || []).map((v) => v.email));

    const newVolunteers = volunteerData.filter(
      (v) => !existingEmails.has(v.email)
    );

    let insertedVolunteers: { id: string; first_name: string; last_name: string; email: string }[] = [];
    if (newVolunteers.length > 0) {
      const { data } = await supabase
        .from("volunteers")
        .insert(newVolunteers.map((v) => ({ org_id: orgId, ...v })))
        .select("id, first_name, last_name, email");
      insertedVolunteers = data || [];
    }

    // Get all volunteers for assignment
    const { data: allVols } = await supabase
      .from("volunteers")
      .select("id, first_name, last_name, email")
      .eq("org_id", orgId);
    const volByEmail = new Map((allVols || []).map((v) => [v.email, v]));

    // ── Assign skills to volunteers ─────────────────────────
    const skillAssignments: { email: string; skills: string[] }[] = [
      { email: "maria.garcia@example.com", skills: ["CPR/First Aid", "Event Setup", "Registration"] },
      { email: "james.w@example.com", skills: ["Event Setup", "Route Marshal"] },
      { email: "sarah.j@example.com", skills: ["Registration", "Data Entry"] },
      { email: "michael.b@example.com", skills: ["Spanish Speaking", "Registration", "Fundraising"] },
      { email: "emily.d@example.com", skills: ["Photography", "Social Media"] },
      { email: "robert.m@example.com", skills: ["Water Station", "Event Setup"] },
      { email: "jennifer.a@example.com", skills: ["CPR/First Aid", "Event Setup"] },
      { email: "lisa.t@example.com", skills: ["Social Media", "Photography", "Fundraising"] },
      { email: "kevin.h@example.com", skills: ["Route Marshal", "CPR/First Aid"] },
      { email: "daniel.l@example.com", skills: ["Event Setup", "Water Station", "Route Marshal"] },
    ];

    const skillInserts: { volunteer_id: string; skill_id: string }[] = [];
    for (const assignment of skillAssignments) {
      const vol = volByEmail.get(assignment.email);
      if (!vol) continue;
      for (const skillName of assignment.skills) {
        const skillId = skillMap.get(skillName);
        if (skillId) {
          skillInserts.push({ volunteer_id: vol.id, skill_id: skillId });
        }
      }
    }

    if (skillInserts.length > 0) {
      // Delete existing assignments for these volunteers first
      const volIds = [...new Set(skillInserts.map((s) => s.volunteer_id))];
      await supabase.from("volunteer_skills").delete().in("volunteer_id", volIds);
      await supabase.from("volunteer_skills").insert(skillInserts);
    }

    // ── Assign roles to volunteers ──────────────────────────
    const roleAssignments: { email: string; roles: string[] }[] = [
      { email: "maria.garcia@example.com", roles: ["Walk Chair"] },
      { email: "james.w@example.com", roles: ["Team Captain"] },
      { email: "jennifer.a@example.com", roles: ["Board Member", "Volunteer Coordinator"] },
      { email: "michael.b@example.com", roles: ["Regional Lead"] },
      { email: "lisa.t@example.com", roles: ["Team Captain"] },
    ];

    const roleInserts: { volunteer_id: string; role_id: string }[] = [];
    for (const assignment of roleAssignments) {
      const vol = volByEmail.get(assignment.email);
      if (!vol) continue;
      for (const roleName of assignment.roles) {
        const roleId = roleMap.get(roleName);
        if (roleId) {
          roleInserts.push({ volunteer_id: vol.id, role_id: roleId });
        }
      }
    }

    if (roleInserts.length > 0) {
      const volIds = [...new Set(roleInserts.map((r) => r.volunteer_id))];
      await supabase.from("volunteer_roles").delete().in("volunteer_id", volIds);
      await supabase.from("volunteer_roles").insert(roleInserts);
    }

    // ── Assign committee members ────────────────────────────
    const committeeAssignments: { committee: string; members: { email: string; role: string }[] }[] = [
      {
        committee: "Event Planning",
        members: [
          { email: "maria.garcia@example.com", role: "Chair" },
          { email: "james.w@example.com", role: "Member" },
          { email: "robert.m@example.com", role: "Member" },
          { email: "daniel.l@example.com", role: "Member" },
        ],
      },
      {
        committee: "Fundraising",
        members: [
          { email: "michael.b@example.com", role: "Chair" },
          { email: "lisa.t@example.com", role: "Member" },
          { email: "amanda.w@example.com", role: "Member" },
        ],
      },
      {
        committee: "Outreach",
        members: [
          { email: "emily.d@example.com", role: "Chair" },
          { email: "lisa.t@example.com", role: "Member" },
          { email: "nicole.w@example.com", role: "Member" },
        ],
      },
      {
        committee: "Training",
        members: [
          { email: "jennifer.a@example.com", role: "Chair" },
          { email: "maria.garcia@example.com", role: "Member" },
          { email: "kevin.h@example.com", role: "Member" },
        ],
      },
    ];

    for (const ca of committeeAssignments) {
      const committeeId = committeeMap.get(ca.committee);
      if (!committeeId) continue;

      // Delete existing members for this committee
      await supabase.from("volunteer_committees").delete().eq("committee_id", committeeId);

      const inserts = ca.members
        .map((m) => {
          const vol = volByEmail.get(m.email);
          if (!vol) return null;
          return { volunteer_id: vol.id, committee_id: committeeId, role: m.role };
        })
        .filter(Boolean);

      if (inserts.length > 0) {
        await supabase.from("volunteer_committees").insert(inserts);
      }
    }

    // ── Events ──────────────────────────────────────────────
    const now = new Date();
    const eventData = [
      {
        title: "Spring Community Walk",
        description: "Annual 5K walk through downtown to raise awareness and funds. Family-friendly event with food vendors and live music at the finish line.",
        location: "Reaves Park",
        address: "2501 Jenkins Ave, Norman, OK 73069",
        start_date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14, 8, 0).toISOString(),
        end_date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14, 12, 0).toISOString(),
        max_volunteers: 25,
        status: "upcoming",
      },
      {
        title: "Volunteer Orientation",
        description: "New volunteer training session covering safety protocols, event procedures, and first aid basics.",
        location: "Norman Public Library - Pioneer Room",
        address: "225 N Webster Ave, Norman, OK 73069",
        start_date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 18, 0).toISOString(),
        end_date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 20, 0).toISOString(),
        max_volunteers: 30,
        status: "upcoming",
      },
      {
        title: "Summer Fun Run",
        description: "Casual fun run event for families. Includes water stations every half mile and a post-run BBQ.",
        location: "Lake Thunderbird State Park",
        address: "13101 Alameda Dr, Norman, OK 73026",
        start_date: new Date(now.getFullYear(), now.getMonth() + 2, 15, 7, 0).toISOString(),
        end_date: new Date(now.getFullYear(), now.getMonth() + 2, 15, 11, 0).toISOString(),
        max_volunteers: 40,
        status: "upcoming",
      },
      {
        title: "Fundraising Gala",
        description: "Annual black-tie fundraising dinner with silent auction. Volunteers needed for setup, registration, and teardown.",
        location: "Embassy Suites Norman",
        address: "2501 Conference Dr, Norman, OK 73069",
        start_date: new Date(now.getFullYear(), now.getMonth() + 1, 20, 17, 0).toISOString(),
        end_date: new Date(now.getFullYear(), now.getMonth() + 1, 20, 22, 0).toISOString(),
        max_volunteers: 15,
        status: "upcoming",
      },
      {
        title: "Park Cleanup Day",
        description: "Community service event to clean up local parks and trails. Gloves and bags provided.",
        location: "Ruby Grant Park",
        address: "1000 Classen Blvd, Norman, OK 73071",
        start_date: new Date(now.getFullYear(), now.getMonth() - 1, 10, 9, 0).toISOString(),
        end_date: new Date(now.getFullYear(), now.getMonth() - 1, 10, 13, 0).toISOString(),
        max_volunteers: 20,
        status: "completed",
      },
      {
        title: "Winter Coat Drive",
        description: "Collecting and distributing winter coats to families in need.",
        location: "Norman Community Center",
        address: "300 E Main St, Norman, OK 73069",
        start_date: new Date(now.getFullYear() - 1, 11, 5, 10, 0).toISOString(),
        end_date: new Date(now.getFullYear() - 1, 11, 5, 16, 0).toISOString(),
        max_volunteers: 12,
        status: "completed",
      },
    ];

    // Check existing events to avoid duplicates
    const { data: existingEvents } = await supabase
      .from("events")
      .select("title")
      .eq("org_id", orgId);
    const existingEventTitles = new Set((existingEvents || []).map((e) => e.title));

    const newEvents = eventData.filter((e) => !existingEventTitles.has(e.title));
    if (newEvents.length > 0) {
      const { data: insertedEvents } = await supabase
        .from("events")
        .insert(newEvents.map((e) => ({ org_id: orgId, ...e })))
        .select("id, title");

      // Assign some volunteers to the completed events with hours
      if (insertedEvents) {
        for (const evt of insertedEvents) {
          if (evt.title === "Park Cleanup Day") {
            const vols = ["maria.garcia@example.com", "james.w@example.com", "sarah.j@example.com", "robert.m@example.com", "daniel.l@example.com"];
            const assigns = vols.map((email, i) => {
              const vol = volByEmail.get(email);
              if (!vol) return null;
              return {
                event_id: evt.id,
                volunteer_id: vol.id,
                hours_logged: [4, 3.5, 4, 3, 4][i],
                notes: i === 0 ? "Team Lead" : null,
              };
            }).filter(Boolean);
            if (assigns.length > 0) {
              await supabase.from("event_volunteers").insert(assigns);
            }
          }

          if (evt.title === "Winter Coat Drive") {
            const vols = ["jennifer.a@example.com", "michael.b@example.com", "lisa.t@example.com", "amanda.w@example.com"];
            const assigns = vols.map((email, i) => {
              const vol = volByEmail.get(email);
              if (!vol) return null;
              return {
                event_id: evt.id,
                volunteer_id: vol.id,
                hours_logged: [6, 5, 4.5, 6][i],
                notes: i === 0 ? "Coordinator" : null,
              };
            }).filter(Boolean);
            if (assigns.length > 0) {
              await supabase.from("event_volunteers").insert(assigns);
            }
          }

          if (evt.title === "Spring Community Walk") {
            const vols = ["maria.garcia@example.com", "kevin.h@example.com", "emily.d@example.com"];
            const assigns = vols.map((email, i) => {
              const vol = volByEmail.get(email);
              if (!vol) return null;
              return {
                event_id: evt.id,
                volunteer_id: vol.id,
                hours_logged: 0,
                notes: ["Event Chair", "Route Marshal", "Photographer"][i],
              };
            }).filter(Boolean);
            if (assigns.length > 0) {
              await supabase.from("event_volunteers").insert(assigns);
            }
          }
        }
      }
    }

    // ── Audit log entries ───────────────────────────────────
    await supabase.from("audit_log").insert({
      org_id: orgId,
      user_id: userId,
      action: "org.updated",
      entity_type: "organization",
      entity_id: orgId,
      metadata: { note: "Sample data loaded" },
    });

    const totalNew =
      newVolunteers.length +
      newEvents.length +
      newSkills.length +
      newRoles.length +
      newCommittees.length;

    if (totalNew === 0) {
      return { success: true, message: "Sample data already loaded - no new records added." };
    }

    return {
      success: true,
      message: `Loaded ${newVolunteers.length} volunteers, ${newEvents.length} events, ${newSkills.length} skills, ${newRoles.length} roles, ${newCommittees.length} committees.`,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, message };
  }
}
