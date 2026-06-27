export type TonalArticle = {
  slug: string
  title: string
  category: string
  seoDescription: string
  content: string
}

export const TONAL_ARTICLES: TonalArticle[] = [
  // ── Getting Started ──────────────────────────────────────────────────────
  {
    slug: 'training-with-tonal',
    title: 'Training with Tonal',
    category: 'Getting Started',
    seoDescription: 'Learn how to start training with Tonal. Discover how workouts are structured, how to choose programs, and how Tonal adapts resistance in real time.',
    content: `
<h2>Getting Started with Tonal Training</h2>
<p>Tonal is a wall-mounted strength training system that replaces an entire weight room with digital resistance and AI coaching. Whether you are new to strength training or a seasoned lifter, understanding how Tonal structures workouts will help you get the most out of every session.</p>

<h2>Choosing Your First Program</h2>
<p>When you first power on Tonal, you will be prompted to complete a brief profile setup that includes your fitness goals, training experience, and any limitations. Based on your answers, Tonal recommends a starting program. You can browse all available programs by tapping <strong>Workouts</strong> from the home screen, then selecting <strong>Programs</strong>.</p>
<p>Programs range from beginner full-body routines to sport-specific strength plans. Each program is broken into sessions with a defined number of sets, reps, and exercises. Tonal tracks your completion and automatically schedules your next session.</p>

<h2>How Tonal Adjusts Resistance</h2>
<p>Tonal uses sensors in each arm to measure how much force you apply during a rep. Over time, the system learns your strength curve and uses that data to recommend weight increases through its <strong>Suggested Weights</strong> feature. You can accept or override the suggestion before starting any set.</p>
<p>Tonal also uses AI modes like <strong>Spotter Mode</strong>, which automatically reduces resistance when it detects you are fatiguing, and <strong>Eccentric Mode</strong>, which adds resistance during the lowering phase of a movement for deeper muscle engagement.</p>

<h2>Understanding Reps and Sets on Tonal</h2>
<p>Each exercise on Tonal shows the target number of reps and sets, your programmed weight, and a timer for rest between sets. The screen displays a real-time rep counter using the arm sensors. You do not need to count — Tonal tracks each full range-of-motion rep automatically.</p>

<h2>Free Lifts vs. Guided Programs</h2>
<p>You can use Tonal in <strong>Free Lift</strong> mode to design your own custom workouts outside of structured programs. Navigate to <strong>Workouts &gt; Free Lift</strong> to build a session by selecting exercises and setting your own weights. Free Lift sessions are still tracked and contribute to your Strength Score.</p>

<h2>Need a Technician?</h2>
<p>If Tonal is not responding correctly during workouts, losing resistance mid-set, or displaying error messages that interrupt training, 2EZ TEK provides Tonal repair service across Dallas Fort Worth. Contact us to schedule a same-week diagnostic visit.</p>
`,
  },
  {
    slug: 'how-to-link-tonal-arms',
    title: 'How to Link Tonal Arms',
    category: 'Getting Started',
    seoDescription: 'Step-by-step guide to linking the left and right arms on your Tonal for the first time or after a reset.',
    content: `
<h2>What Does "Linking Tonal Arms" Mean?</h2>
<p>Tonal's two arms are independent electronic units that each contain sensors for tracking resistance and position. "Linking" the arms means pairing them to the Tonal unit so the system knows which arm is left and which is right. This is required during initial setup and after any arm reset or hardware replacement.</p>

<h2>When to Link Arms</h2>
<ul>
<li>During first-time setup after installation</li>
<li>After performing a factory reset on your Tonal</li>
<li>After replacing one or both arms</li>
<li>When arms are displaying cross-linked resistance values</li>
<li>After a firmware update that resets arm pairing</li>
</ul>

<h2>How to Link Your Tonal Arms</h2>
<ol>
<li>From the Tonal home screen, swipe down from the top and tap <strong>Settings</strong>.</li>
<li>Select <strong>Device</strong>, then tap <strong>Link Arms</strong>.</li>
<li>Follow the on-screen instructions. Tonal will prompt you to extend and retract each arm individually so it can assign left and right designations.</li>
<li>Hold the left arm fully extended for 3 seconds, then return it to the stowed position when prompted.</li>
<li>Repeat for the right arm.</li>
<li>Tonal will confirm successful pairing with a green checkmark on screen.</li>
</ol>

<h2>Troubleshooting Arm Linking Failures</h2>
<p>If the arm linking process fails or the arms continue to show reversed resistance values after pairing, perform a full cable walk-out first, then retry the linking procedure. Persistent pairing failures may indicate a hardware issue with the arm sensors or the main Tonal board.</p>
<p>2EZ TEK technicians in Dallas Fort Worth can diagnose and repair Tonal arm sensor and calibration issues. Contact us for a same-week appointment.</p>
`,
  },
  {
    slug: 'how-to-determine-the-mac-address-of-your-tonal',
    title: 'How to Determine the MAC Address of Your Tonal',
    category: 'Getting Started',
    seoDescription: 'Find your Tonal MAC address for network configuration, IT setup, or support requests.',
    content: `
<h2>Why You Might Need Your Tonal MAC Address</h2>
<p>Your Tonal's MAC address (Media Access Control address) is a unique hardware identifier assigned to its WiFi adapter. You may need this address for:</p>
<ul>
<li>Setting up MAC address filtering on a home or corporate network router</li>
<li>Providing network information to a corporate IT department</li>
<li>Verifying device identity during a support call with Tonal</li>
<li>Troubleshooting network connectivity issues</li>
</ul>

<h2>How to Find Your Tonal MAC Address</h2>
<ol>
<li>From the Tonal home screen, swipe down from the top of the display.</li>
<li>Tap the <strong>Settings</strong> gear icon.</li>
<li>Scroll down and select <strong>About</strong>.</li>
<li>Your MAC address is listed under <strong>WiFi MAC Address</strong> in the format XX:XX:XX:XX:XX:XX.</li>
</ol>

<h2>Using Your MAC Address for Network Setup</h2>
<p>If you are on a network that restricts devices by MAC address, log in to your router's admin interface and add Tonal's MAC address to the approved device list. After adding the address, restart your router and attempt to connect Tonal to your WiFi network through <strong>Settings &gt; WiFi</strong>.</p>

<h2>Alternative: Find MAC Address During Tonal Setup</h2>
<p>If Tonal has not yet connected to WiFi and you need the MAC address to whitelist it before setup, the MAC address is also printed on a label on the back of the Tonal unit near the power connection port.</p>
`,
  },
  {
    slug: 'how-to-login-to-your-tonal-account',
    title: 'How to Login to Your Tonal Account',
    category: 'Getting Started',
    seoDescription: 'How to log in to your Tonal account on the device, the Tonal mobile app, and the Tonal website.',
    content: `
<h2>Logging In on the Tonal Device</h2>
<p>When you approach your Tonal, the device will either display a profile selection screen or a login prompt depending on your security settings.</p>
<ol>
<li>Tap your profile name or photo on the profile selection screen.</li>
<li>If Screen Lock is enabled, you will be prompted to enter your PIN or scan your QR code.</li>
<li>If you previously selected "Remember My Password," Tonal will log you in automatically after selecting your profile.</li>
</ol>

<h2>Logging In with Email and Password</h2>
<p>If you are logging in for the first time or after a sign-out:</p>
<ol>
<li>Tap <strong>Sign In</strong> on the Tonal home screen.</li>
<li>Enter the email address associated with your Tonal account.</li>
<li>Enter your password and tap <strong>Sign In</strong>.</li>
<li>Optionally select <strong>Remember My Password</strong> to skip this step in the future.</li>
</ol>

<h2>Logging In on the Tonal Mobile App</h2>
<ol>
<li>Open the Tonal app on your iPhone or Android device.</li>
<li>Tap <strong>Sign In</strong>.</li>
<li>Enter your registered email and password.</li>
<li>The app syncs your workout history and progress automatically after sign-in.</li>
</ol>

<h2>Forgot Your Password?</h2>
<p>Tap <strong>Forgot Password</strong> on the sign-in screen and enter your email address. You will receive a reset link within a few minutes. Check your spam folder if it does not arrive. After resetting, sign in on both the device and the mobile app.</p>

<h2>Trouble Signing In?</h2>
<p>If your account is locked or you cannot receive a reset email, contact Tonal support directly. For hardware issues preventing the sign-in screen from loading (frozen display, black screen, unresponsive touch), 2EZ TEK provides Tonal repair service in Dallas Fort Worth.</p>
`,
  },
  {
    slug: 'start-strong-with-tonal-weight-assessment-workout',
    title: 'Start Strong with Tonal: Weight Assessment Workout',
    category: 'Getting Started',
    seoDescription: 'Learn how the Tonal weight assessment workout works, what it measures, and how it sets your starting weights for future training.',
    content: `
<h2>What Is the Tonal Weight Assessment?</h2>
<p>The Weight Assessment Workout is a short introductory session Tonal uses to measure your baseline strength before recommending starting weights for exercises. It typically covers 4 to 6 fundamental movement patterns including a squat, a press, a hinge, and a row.</p>

<h2>How the Assessment Works</h2>
<p>During the assessment, Tonal starts at a conservative resistance and gradually increases weight across several reps. The arm sensors measure your output on each rep, calculating how much force you apply through the full range of motion. Based on this data, Tonal's AI establishes starting weights for each major muscle group.</p>

<h2>Tips for Getting an Accurate Assessment</h2>
<ul>
<li>Perform each rep with controlled, full range of motion. Partial reps will skew your starting weights lower.</li>
<li>Do not rush. Tonal measures force output, not speed, so moving too quickly reduces the accuracy of the reading.</li>
<li>If a suggested weight feels too heavy or too light during the assessment, use the on-screen controls to adjust before starting the set.</li>
</ul>

<h2>After the Assessment</h2>
<p>Once the assessment is complete, Tonal will display your initial strength baseline and suggest a starting program based on your goals. You can retake the assessment at any time from <strong>Settings &gt; Fitness Profile &gt; Retake Assessment</strong> if you feel your starting weights are significantly off.</p>

<h2>Does Tonal Adjust Weights Over Time?</h2>
<p>Yes. The Suggested Weights feature continuously updates your recommended resistance based on recent workout performance. As you complete more sessions, Tonal's recommendations become more accurate. You are never locked into the assessment results permanently.</p>
`,
  },
  {
    slug: 'how-to-stow-tonals-arms',
    title: "How to Stow Tonal's Arms",
    category: 'Getting Started',
    seoDescription: "Learn the correct way to stow Tonal's arms after a workout to protect cables, prevent wear, and keep your space clear.",
    content: `
<h2>Why Proper Arm Stowing Matters</h2>
<p>Tonal's arms house internal cables and sensor electronics. Allowing the arms to hang freely or rest at awkward angles puts unnecessary tension on the cables and can accelerate wear on the cable drum and tension system. Stowing the arms after every workout extends the life of your Tonal significantly.</p>

<h2>How to Stow the Arms</h2>
<ol>
<li>After finishing your workout, hold each arm at the handle.</li>
<li>Gently push the arm upward and inward until it clicks into the stowed position. The arm should sit flush against the Tonal body at approximately a 45-degree upward angle.</li>
<li>Repeat for the other arm.</li>
<li>Tonal will display a "Arms Stowed" confirmation on screen if Screen Lock or post-workout reminders are enabled.</li>
</ol>

<h2>What If an Arm Will Not Click Into Place?</h2>
<p>If an arm feels loose, does not click securely, or falls back down after stowing, this typically indicates one of three issues:</p>
<ul>
<li>The locking mechanism is worn or damaged</li>
<li>Cable tension is preventing the arm from reaching its natural rest position</li>
<li>A calibration issue is affecting the arm's range of motion</li>
</ul>
<p>A cable walk-out often resolves tension-related stowing issues. If the problem persists, 2EZ TEK provides Tonal repair in Dallas Fort Worth and can inspect the arm locking mechanism.</p>

<h2>Tonal's Auto-Stow Reminder</h2>
<p>If Screen Lock is enabled, Tonal will display a reminder to stow the arms before signing out. This feature helps prevent the arms from being left extended, which can cause cable strain overnight.</p>
`,
  },
  {
    slug: 'arm-position-indicator',
    title: 'Arm Position Indicator',
    category: 'Getting Started',
    seoDescription: 'Understand what the Tonal Arm Position Indicator shows and how it helps you set up exercises correctly.',
    content: `
<h2>What Is the Arm Position Indicator?</h2>
<p>The Arm Position Indicator is a visual guide displayed on Tonal's screen during exercise setup. It shows the recommended height and angle for each arm based on the selected exercise, helping you position the arms correctly before you begin a set.</p>

<h2>How to Use the Arm Position Indicator</h2>
<ol>
<li>Select an exercise from a program or Free Lift.</li>
<li>On the setup screen, look for the silhouette diagram showing arm positions. The cyan colored indicator shows where the arms should be for that exercise.</li>
<li>Physically adjust the left and right arm to match the diagram before starting the set.</li>
<li>Tap <strong>Start</strong> when both arms are in the correct position.</li>
</ol>

<h2>Common Arm Positions</h2>
<ul>
<li><strong>High (Level 5–7):</strong> Used for lat pulldowns, tricep pushdowns, and face pulls.</li>
<li><strong>Mid (Level 3–4):</strong> Used for rows, chest flys, and standing presses.</li>
<li><strong>Low (Level 1–2):</strong> Used for deadlifts, bicep curls, and upright rows.</li>
</ul>

<h2>What If the Arms Do Not Lock at the Indicated Position?</h2>
<p>Tonal arms have multiple locking positions. If an arm does not engage at the position shown on screen, lift the arm slightly while pressing it toward the Tonal body to find the nearest locking point. Arms should click audibly when locked.</p>
<p>If an arm no longer locks into position reliably, this may indicate wear on the adjustment mechanism. Contact 2EZ TEK in Dallas Fort Worth for a service inspection.</p>
`,
  },
  {
    slug: 'how-to-pair-bluetooth-headphones-and-speakers',
    title: 'How to Pair Bluetooth Headphones and Speakers',
    category: 'Getting Started',
    seoDescription: 'Step-by-step instructions for pairing Bluetooth headphones or speakers to your Tonal for audio during workouts.',
    content: `
<h2>Bluetooth Audio on Tonal</h2>
<p>Tonal supports Bluetooth audio output so you can listen to workout audio, music, and coaching cues through wireless headphones or a Bluetooth speaker. Tonal's built-in speakers are functional but pairing headphones gives you a more focused training experience.</p>

<h2>How to Pair Bluetooth Headphones</h2>
<ol>
<li>Put your headphones or speaker into pairing mode (usually by holding the power button until you see a flashing LED or hear a pairing tone).</li>
<li>On Tonal, swipe down from the top of the screen and tap <strong>Settings</strong>.</li>
<li>Select <strong>Bluetooth</strong>.</li>
<li>Tonal will scan for available devices. Your headphones should appear in the list within a few seconds.</li>
<li>Tap your headphones' name to pair. You will see a "Connected" confirmation when successful.</li>
</ol>

<h2>Supported Bluetooth Profiles</h2>
<p>Tonal supports the A2DP Bluetooth profile for stereo audio. Most consumer headphones and portable speakers are compatible. Devices that only support HFP (hands-free profile) for phone calls may not work correctly.</p>

<h2>Troubleshooting Bluetooth Connection Issues</h2>
<ul>
<li><strong>Device not appearing in list:</strong> Make sure headphones are in active pairing mode, not just powered on. Most devices exit pairing mode after 30 seconds.</li>
<li><strong>Connection drops during workout:</strong> Keep your device within 30 feet of Tonal. Metal in walls and other 2.4 GHz devices can cause interference.</li>
<li><strong>Audio delay or sync issues:</strong> Try forgetting and re-pairing the device. Audio latency varies by headphone model.</li>
<li><strong>Previously paired device not reconnecting:</strong> Go to Settings &gt; Bluetooth, tap the device name, select Forget, then re-pair from scratch.</li>
</ul>
`,
  },
  {
    slug: 'how-to-wrap-the-tonal-power-cord',
    title: 'How to Wrap the Tonal Power Cord',
    category: 'Getting Started',
    seoDescription: 'Learn the correct way to wrap and manage the Tonal power cord to prevent damage and maintain a clean installation.',
    content: `
<h2>Tonal Power Cord Management</h2>
<p>Tonal requires a standard 120V outlet within approximately 6 feet of the unit. Proper cord management keeps the installation looking clean and prevents accidental cord damage from foot traffic or equipment movement.</p>

<h2>How to Wrap the Power Cord</h2>
<ol>
<li>Route the cord along the wall behind the Tonal unit from the outlet to the power port on the back of the device.</li>
<li>Use the included cord clips or cable management channels to secure the cord flat against the wall.</li>
<li>Leave a small loop of slack at both the outlet and the Tonal power port connection to prevent strain on the plugs if the unit flexes slightly during heavy lifts.</li>
<li>Do not coil excess cord tightly. A loose S-curve along the baseboard is preferred over a tight coil, which can trap heat in the cord.</li>
</ol>

<h2>What Not to Do with the Power Cord</h2>
<ul>
<li>Do not run the cord under rugs or carpet. Heat buildup can damage the insulation.</li>
<li>Do not use an extension cord. Tonal's power draw requires a direct outlet connection.</li>
<li>Do not pinch the cord under the Tonal mounting bracket or behind the unit body.</li>
<li>Do not wrap the cord tightly around Tonal's body or arms during storage.</li>
</ul>

<h2>Cord Damage Warning Signs</h2>
<p>Inspect the power cord periodically for cuts, fraying near the plugs, or discoloration from heat. A damaged power cord should be replaced before continuing use. Contact Tonal support for an authorized replacement cord. 2EZ TEK can also inspect power-related issues as part of a Tonal service visit in Dallas Fort Worth.</p>
`,
  },
  {
    slug: 'how-to-assemble-the-tonal-bench',
    title: 'How to Assemble the Tonal Bench',
    category: 'Getting Started',
    seoDescription: 'Step-by-step instructions for assembling the Tonal adjustable workout bench.',
    content: `
<h2>What Is Included with the Tonal Bench</h2>
<p>The Tonal Bench ships flat-packed with the following components: bench frame, seat pad, back pad, leg pad, four leg assemblies, and all required hardware including hex bolts and an Allen key.</p>

<h2>Assembly Steps</h2>
<ol>
<li><strong>Lay out all parts</strong> on a clean, flat surface and verify all hardware is present before starting.</li>
<li><strong>Attach the legs</strong> to the frame. Insert the threaded leg posts into the frame holes and hand-tighten the hex bolts before applying final torque with the Allen key.</li>
<li><strong>Secure the seat pad</strong> to the front frame section using the provided bolts. Verify the pad clicks or locks into its seat bracket.</li>
<li><strong>Attach the back pad</strong> to the incline hinge. The back pad should pivot smoothly through at least 4 angle positions: flat, 30, 45, and 90 degrees.</li>
<li><strong>Attach the leg pad</strong> (if included with your bench model) to the lower frame using the same hex bolt pattern.</li>
<li><strong>Torque all bolts</strong> to a firm but not over-tightened level. Over-tightening can strip the aluminum threads in the frame.</li>
</ol>

<h2>Adjusting the Bench Incline</h2>
<p>The back pad adjustment lever is located under the seat. Pull the lever toward you, change the back pad angle, then release the lever until it clicks into the new position. Test by pressing down on the back pad to verify it is locked before using it.</p>

<h2>Bench Maintenance</h2>
<p>Check all bolts every 3 to 6 months for looseness. Pads can be wiped clean with a damp cloth. Avoid harsh cleaners that can degrade the vinyl pad covering.</p>
`,
  },
  {
    slug: 'how-to-activate-your-tonal-membership',
    title: 'How to Activate Your Tonal Membership',
    category: 'Getting Started',
    seoDescription: 'How to activate your Tonal membership after installation and what is included in your membership plan.',
    content: `
<h2>When Is the Membership Activated?</h2>
<p>Your Tonal membership begins on the day of installation. Tonal's membership billing starts automatically after your installation is complete, unless you are in a promotional free-trial period.</p>

<h2>How to Activate During Setup</h2>
<ol>
<li>After installation, power on Tonal and follow the on-screen setup prompts.</li>
<li>Sign in or create a Tonal account when prompted.</li>
<li>On the membership screen, review the plan details and confirm your payment method on file.</li>
<li>Tap <strong>Activate Membership</strong> to complete the process.</li>
<li>Tonal will confirm activation with a welcome screen and prompt you to complete your fitness profile.</li>
</ol>

<h2>What Is Included in the Tonal Membership?</h2>
<ul>
<li>Access to the full library of on-demand workouts and programs</li>
<li>Live and on-demand classes led by Tonal coaches</li>
<li>AI features including Spotter Mode, Smart Flex, and Suggested Weights</li>
<li>Strength Score tracking and personal records</li>
<li>Leaderboards and challenges</li>
<li>Integration with Apple Health, Strava, and Garmin</li>
<li>Multiple household member profiles</li>
</ul>

<h2>Managing or Canceling Your Membership</h2>
<p>Membership settings are managed through your account at tonal.com or through the Tonal mobile app. You can pause, change, or cancel your membership from the Account section. Note that canceling membership disables AI features and limits access to live classes on the device.</p>
`,
  },
  {
    slug: 'auto-weight-off',
    title: 'Auto Weight Off',
    category: 'Getting Started',
    seoDescription: 'Learn what Tonal Auto Weight Off does, when it activates, and how to disable or enable it.',
    content: `
<h2>What Is Auto Weight Off?</h2>
<p>Auto Weight Off is a safety feature that automatically reduces Tonal's resistance to zero when the system detects that you have released the handle or stopped exercising mid-set. This prevents the cables from snapping back under full tension when you let go unexpectedly.</p>

<h2>When Does Auto Weight Off Activate?</h2>
<ul>
<li>When you release the handle or drop the bar during a set</li>
<li>When the cable goes slack for more than 2 seconds while in an active exercise</li>
<li>When you step away from the exercise position and the motion sensors detect no load</li>
</ul>

<h2>How to Resume After Auto Weight Off</h2>
<p>When Auto Weight Off activates during a set, the screen will show a pause prompt. Grip the handles, take your starting position, and tap <strong>Resume</strong> on screen to re-engage the programmed resistance. Tonal will ramp back up to your set weight over approximately 1 second.</p>

<h2>Can Auto Weight Off Be Disabled?</h2>
<p>Auto Weight Off cannot be fully disabled as it is a core safety mechanism. However, you can adjust sensitivity settings in <strong>Settings &gt; Workout Preferences</strong>. Setting the sensitivity to Low reduces false triggers during exercises where you briefly shift your grip or pause between reps.</p>

<h2>False Triggers</h2>
<p>Auto Weight Off is most commonly triggered incorrectly during exercises with brief pauses at the top of the movement, such as pause squats or slow-tempo rows. If you experience frequent false triggers during a specific exercise, lowering the sensitivity or using the Hold feature to pause manually between reps can help.</p>
`,
  },
  {
    slug: 'accessory-setup-pairing-tonal-smart-accessories',
    title: 'Accessory Setup: Pairing Tonal Smart Accessories',
    category: 'Getting Started',
    seoDescription: 'How to pair and set up Tonal Smart Accessories including the Smart Bar, Smart Handles, Rope, and other attachments.',
    content: `
<h2>What Are Tonal Smart Accessories?</h2>
<p>Tonal Smart Accessories are Bluetooth-enabled attachments that communicate directly with the Tonal unit to enable exercises that go beyond the standard cable handles. Smart Accessories include the Smart Bar, Smart Handles, Rope, and in some bundles, a Hip Hinge Belt.</p>

<h2>How to Pair a Smart Accessory</h2>
<ol>
<li>Make sure the accessory battery is charged. Smart Accessories charge via USB-C. A full charge takes approximately 1 to 2 hours and lasts for several weeks of regular use.</li>
<li>From the Tonal home screen, swipe down and tap <strong>Settings</strong>.</li>
<li>Select <strong>Accessories</strong>, then tap <strong>Pair New Accessory</strong>.</li>
<li>Activate the accessory by pressing its pairing button (usually on the side of the handle or along the bar).</li>
<li>Tonal will detect and display the accessory name. Tap it to complete pairing.</li>
</ol>

<h2>Using a Smart Accessory in a Workout</h2>
<p>After pairing, Smart Accessories are available automatically during compatible exercises. When you select an exercise that uses a bar or rope, Tonal will prompt you to attach the Smart Accessory to the cable carabiner. Exercises using Smart Accessories are indicated in the workout library with a small accessory icon.</p>

<h2>Troubleshooting Pairing Issues</h2>
<ul>
<li><strong>Accessory not appearing in pairing list:</strong> Ensure the accessory is in active Bluetooth pairing mode, not just powered on. Most accessories time out of pairing mode after 30 seconds.</li>
<li><strong>Accessory disconnects mid-workout:</strong> Move closer to Tonal. Smart Accessories require a Bluetooth connection and can drop if obstructed.</li>
<li><strong>Accessory not registering weight:</strong> Charge the accessory fully and re-pair. If the problem persists, the internal sensor may require service.</li>
</ul>
`,
  },
  {
    slug: 'smart-accessories',
    title: 'Smart Accessories Overview',
    category: 'Getting Started',
    seoDescription: 'Overview of all Tonal Smart Accessories, what each one does, and which exercises each accessory enables.',
    content: `
<h2>Tonal Smart Accessories</h2>
<p>Tonal's Smart Accessories expand the range of exercises you can perform beyond standard cable movements. Each accessory connects via Bluetooth to the Tonal unit and is tracked just like the built-in handles.</p>

<h2>Smart Bar</h2>
<p>The Smart Bar is a 47-inch barbell attachment that clips into both Tonal cable ends. It enables barbell exercises including bench press, squats, overhead press, bent-over rows, and deadlifts. The Smart Bar contains an internal sensor that reads combined bilateral resistance and confirms bar balance between both arms.</p>

<h2>Smart Handles</h2>
<p>Smart Handles are ergonomic D-ring style handles with built-in Bluetooth sensors. They replace the standard cable handles and enable exercises that require neutral grip or a more natural wrist position, such as hammer curls, neutral-grip rows, and tricep kickbacks.</p>

<h2>Rope</h2>
<p>The Rope accessory attaches to a single cable point and is used for tricep pushdowns, face pulls, and rope hammer curls. Unlike a standard rope, the Tonal Rope has a sensor connector that allows it to register as a Smart Accessory for tracking purposes.</p>

<h2>Hip Hinge Belt</h2>
<p>Available in select bundles, the Hip Hinge Belt attaches around your waist and connects to Tonal's cable to enable hip hinge and hip thrust movements with direct load on the hips rather than through the hands.</p>

<h2>Accessory Compatibility</h2>
<p>All Smart Accessories require an active Tonal membership and must be paired via Bluetooth through the Settings menu. They are compatible with both original Tonal and Tonal 2 units.</p>
`,
  },
  {
    slug: 'how-to-avoid-cable-rub',
    title: 'How to Avoid Cable Rub',
    category: 'Getting Started',
    seoDescription: 'Learn what causes cable rub on Tonal and how to position yourself and the arms to prevent cable wear.',
    content: `
<h2>What Is Cable Rub?</h2>
<p>Cable rub occurs when Tonal's cables make sustained contact with the body of the unit, the frame, or each other during an exercise. Repeated rubbing wears down the cable sheath and can eventually damage the internal steel cable strands, leading to fraying or snapping under load.</p>

<h2>Common Causes of Cable Rub</h2>
<ul>
<li>Standing too close to Tonal during pulling exercises, causing the cable to angle back into the unit at a sharp bend</li>
<li>Setting arm height too high or too low for an exercise, forcing the cable into an unnatural path</li>
<li>Using a wide grip on exercises where the cables cross over each other</li>
<li>Cable attachments that direct the load path at an angle across the frame</li>
</ul>

<h2>How to Prevent Cable Rub</h2>
<ol>
<li><strong>Follow the arm position indicator</strong> on screen for each exercise. Tonal's recommended heights minimize cable angle stress.</li>
<li><strong>Step back from Tonal</strong> far enough that the cable exits the arm at a gentle angle, not a sharp bend.</li>
<li><strong>Avoid crossing cables</strong> during bilateral exercises. Keep cable paths parallel whenever possible.</li>
<li><strong>Inspect cables monthly</strong> by running your fingers along the cable sheath near the attachment point to feel for any roughness or fraying.</li>
</ol>

<h2>What to Do If You See Cable Wear</h2>
<p>Frayed or worn cables should not be used. Continued use risks cable failure under load. 2EZ TEK provides Tonal cable replacement service in Dallas Fort Worth. Contact us to schedule a repair before the cable reaches the point of failure.</p>
`,
  },
  {
    slug: 'tonal-settings-and-profile-options',
    title: 'Everything You Need to Know About Tonal Settings and Profile Options',
    category: 'Getting Started',
    seoDescription: 'Complete guide to Tonal settings including display, audio, workout preferences, Bluetooth, WiFi, and user profile options.',
    content: `
<h2>Accessing Tonal Settings</h2>
<p>To open Settings, swipe down from the top of the Tonal screen and tap the gear icon. Settings are organized into sections covering your device, your account, and your workout preferences.</p>

<h2>Display Settings</h2>
<ul>
<li><strong>Brightness:</strong> Adjust screen brightness using the slider. Auto-brightness can be toggled on or off.</li>
<li><strong>Sleep timeout:</strong> Set how long Tonal waits before entering sleep mode after detecting no activity. Options range from 2 minutes to 30 minutes.</li>
<li><strong>Mirror/Camera (Tonal 2 only):</strong> Enable the Smart View screen reflection and camera features.</li>
</ul>

<h2>Audio Settings</h2>
<ul>
<li><strong>Volume:</strong> Separate sliders for workout audio, music, and coaching voice cues.</li>
<li><strong>Bluetooth audio:</strong> Manage paired Bluetooth speakers and headphones.</li>
<li><strong>Do Not Disturb:</strong> Mutes all notifications during active workouts.</li>
</ul>

<h2>Workout Preferences</h2>
<ul>
<li><strong>Auto Weight Off sensitivity:</strong> Low, Medium, or High. Controls how quickly Tonal drops resistance when you release a handle.</li>
<li><strong>Rest timer:</strong> Enable or disable automatic rest timers between sets and adjust default rest duration.</li>
<li><strong>Units:</strong> Switch between pounds and kilograms for displayed resistance values.</li>
</ul>

<h2>Profile Settings</h2>
<ul>
<li><strong>Fitness Profile:</strong> Update your goals, height, weight, and training experience. These inform Suggested Weights.</li>
<li><strong>Retake Assessment:</strong> Re-run the weight assessment to reset starting weights after a long break from training.</li>
<li><strong>Profile photo:</strong> Set a profile image that appears on the profile selection screen.</li>
</ul>

<h2>Security Settings</h2>
<ul>
<li><strong>Screen Lock:</strong> Require PIN or QR code at login and auto-logout after 2 minutes of inactivity.</li>
<li><strong>Remember My Password:</strong> Toggle automatic sign-in for your profile.</li>
</ul>
`,
  },
  {
    slug: 'safety-recommendations',
    title: 'Safety Recommendations for Tonal',
    category: 'Getting Started',
    seoDescription: 'Official Tonal safety recommendations including installation requirements, safe use during workouts, and accessory safety.',
    content: `
<h2>Installation Safety</h2>
<ul>
<li>Tonal must be mounted into wall studs rated for a minimum of 300 lbs combined load.</li>
<li>Never mount Tonal into drywall anchors alone without stud backing.</li>
<li>Maintain a minimum of 7 feet of clear space in front of Tonal for safe exercise movement.</li>
<li>The power outlet must be within 6 feet of the unit. Do not use extension cords.</li>
</ul>

<h2>During Workouts</h2>
<ul>
<li>Always warm up before increasing to your working weight. Begin sets at a lower resistance and progress to your programmed weight.</li>
<li>Do not exceed the 200-lb maximum combined resistance. Exceeding this limit can damage the cable system.</li>
<li>Keep children and pets out of the exercise area during use.</li>
<li>Never use Tonal with wet hands. Moisture on the handles reduces grip security.</li>
<li>Wear appropriate footwear. Tonal exercises involve significant lower body loading and bare feet are not recommended for heavy lifts.</li>
</ul>

<h2>Accessory Safety</h2>
<ul>
<li>Inspect carabiner attachments before each use. Do not use a bent, cracked, or worn carabiner.</li>
<li>Verify that the Smart Bar is locked into both cable carabiners before performing barbell movements.</li>
<li>Do not modify accessories or use non-Tonal attachments. Unauthorized attachments can exceed cable load ratings.</li>
</ul>

<h2>After Your Workout</h2>
<ul>
<li>Stow the arms completely after every session.</li>
<li>Remove Smart Accessories from the cables and store them on the accessory rack.</li>
<li>If Tonal displays any error messages after a workout, address them before the next session.</li>
</ul>
`,
  },
  {
    slug: 'strength-score',
    title: 'Strength Score',
    category: 'Getting Started',
    seoDescription: 'Learn what the Tonal Strength Score is, how it is calculated, and how to improve your score over time.',
    content: `
<h2>What Is Tonal Strength Score?</h2>
<p>Strength Score is a single number that represents your overall strength level relative to your body weight, calculated from your performance across all exercises on Tonal. It updates after every workout and is designed to give you a simple, trackable measure of your strength progress over time.</p>

<h2>How Is Strength Score Calculated?</h2>
<p>Tonal calculates your Strength Score based on the maximum weight you have demonstrated across a set of foundational movement patterns including push, pull, hinge, squat, and carry. The score normalizes for body weight so it reflects your relative strength rather than absolute numbers. The more exercises you complete, the more accurate your score becomes.</p>

<h2>Strength Score Ranges</h2>
<ul>
<li><strong>0–500:</strong> Beginner. Building foundational strength patterns.</li>
<li><strong>500–1000:</strong> Intermediate. Consistent strength development across major movements.</li>
<li><strong>1000–1500:</strong> Advanced. Significant strength relative to body weight.</li>
<li><strong>1500+:</strong> Elite. Top tier of Tonal users measured against the platform average.</li>
</ul>

<h2>How to Improve Your Strength Score</h2>
<ul>
<li>Complete workouts consistently across multiple movement patterns, not just your favorites.</li>
<li>Accept Suggested Weight increases when prompted. Your score rises as you set new personal records.</li>
<li>Perform the assessment periodically if you have been training for several months since your last one.</li>
<li>Complete programs that span multiple muscle groups rather than repeating the same single-exercise sessions.</li>
</ul>

<h2>Strength Score vs. Leaderboard Rank</h2>
<p>Your Strength Score is personal and normalized to your body. Leaderboard rankings are based on workout volume and consistency rather than raw Strength Score, so they reflect different aspects of your training.</p>
`,
  },
  {
    slug: 'getting-to-know-your-tonal',
    title: 'Getting to Know Your Tonal',
    category: 'Getting Started',
    seoDescription: 'A complete orientation to your Tonal unit: the screen, arms, cables, buttons, ports, and how all the parts work together.',
    content: `
<h2>The Tonal Display</h2>
<p>Tonal features a 24-inch touchscreen mounted at the center of the unit. The display runs Tonal's operating system and serves as your interface for selecting workouts, adjusting settings, viewing coaching cues, and tracking your performance in real time.</p>

<h2>The Arms</h2>
<p>Tonal has two independently adjustable arms, one on each side of the display. Each arm contains an internal cable, a Bluetooth sensor module, and a carabiner attachment point at the end. Arms lock into multiple height positions from approximately knee level to above shoulder height.</p>

<h2>The Cables</h2>
<p>Each arm houses a retractable steel cable that travels from the cable drum inside the Tonal body to the carabiner at the arm tip. The cable provides the physical resistance during exercises. Tonal's digital resistance system controls how much tension the cable motor applies, from 0 to 100 lbs per arm (200 lbs combined).</p>

<h2>The Power Button</h2>
<p>The power button is located on the back of the Tonal unit. A short press wakes Tonal from sleep. A 2-second hold powers the unit on from full off. A 10-second hold initiates a force restart when the screen is unresponsive.</p>

<h2>Ports</h2>
<ul>
<li><strong>Power port:</strong> Standard 120V power cord connection on the back, lower right.</li>
<li><strong>USB-A port:</strong> For charging mobile devices or accessories. Located on the side of the unit or inside the accessory slot depending on model.</li>
</ul>

<h2>The Accessory Rail</h2>
<p>Along the sides of the Tonal body are magnetic rails where Smart Accessories and standard cable handles can be stored when not in use. Store all accessories on the rail after every workout to keep the cables clear and the exercise area organized.</p>
`,
  },
  {
    slug: 'welcome-to-tonal',
    title: 'Welcome to Tonal!',
    category: 'Getting Started',
    seoDescription: 'Welcome guide for new Tonal owners. What to do after installation, how to set up your account, and how to get your first workout done.',
    content: `
<h2>Congratulations on Your Tonal</h2>
<p>Your Tonal is now installed and ready to use. This guide walks you through the first steps to take after installation to get set up and into your first workout as quickly as possible.</p>

<h2>Step 1: Connect to WiFi</h2>
<p>Tonal requires an active WiFi connection for workouts, software updates, and membership features. From the setup screen, select your WiFi network and enter your password. Tonal works with both 2.4 GHz and 5 GHz networks.</p>

<h2>Step 2: Create or Sign In to Your Account</h2>
<p>If you already created a Tonal account during purchase, sign in with your email and password. If not, tap <strong>Create Account</strong> and follow the prompts. Your account is linked to your membership and stores all workout history and progress data.</p>

<h2>Step 3: Complete Your Fitness Profile</h2>
<p>Tonal will ask about your fitness goals, training experience, and any physical limitations. This information helps the system recommend appropriate programs and starting weights. Be honest with your experience level — it is easy to adjust weights up from the start, but harder to recover from overloading too early.</p>

<h2>Step 4: Complete the Weight Assessment</h2>
<p>The weight assessment is a short workout that calibrates Tonal to your current strength level. It typically takes 10 to 15 minutes and covers 4 to 6 fundamental movements. After the assessment, Tonal will have accurate starting weights for your exercise programs.</p>

<h2>Step 5: Pick a Program</h2>
<p>Browse programs under <strong>Workouts &gt; Programs</strong> and select one that matches your goals. Tonal will schedule sessions for you and track completion automatically.</p>

<h2>Questions or Issues?</h2>
<p>For Tonal setup issues, WiFi problems, or hardware concerns in Dallas Fort Worth, 2EZ TEK provides professional Tonal service. Contact us for same-week assistance.</p>
`,
  },
  {
    slug: 'general-maintenance',
    title: 'Tonal General Maintenance',
    category: 'Getting Started',
    seoDescription: 'Tonal maintenance guide covering cable inspection, screen cleaning, arm mechanism upkeep, and when to call a technician.',
    content: `
<h2>Why Regular Maintenance Matters</h2>
<p>Tonal is a motorized, cable-driven strength system. Like any mechanical equipment, it benefits from periodic inspection to catch early signs of wear before they become costly repairs. Most maintenance tasks are visual and take only a few minutes.</p>

<h2>Monthly Checks</h2>
<ul>
<li><strong>Cable inspection:</strong> Run your fingers along each cable from the arm tip to where it enters the arm body. Feel for fraying, kinking, or roughness in the sheath. Any rough spots indicate wear that should be addressed.</li>
<li><strong>Carabiner check:</strong> Open and close each carabiner to verify the locking gate is secure. Replace any carabiner that does not click shut completely.</li>
<li><strong>Screen cleaning:</strong> Wipe the touchscreen with a slightly damp microfiber cloth. Avoid household sprays and alcohol-based cleaners that can damage the anti-glare coating.</li>
</ul>

<h2>Every 3 to 6 Months</h2>
<ul>
<li><strong>Wall bracket inspection:</strong> Check that all mounting bolts are tight. Vibration from heavy lifts can cause gradual loosening over months.</li>
<li><strong>Arm mechanism check:</strong> Test all arm locking positions to ensure each one clicks securely. Loose or skipping positions may indicate locking pin wear.</li>
<li><strong>Software update:</strong> Verify Tonal is running the latest software version under <strong>Settings &gt; About</strong>. Updates often include performance and calibration improvements.</li>
</ul>

<h2>When to Call a Technician</h2>
<p>Contact 2EZ TEK for professional Tonal service in Dallas Fort Worth if you notice:</p>
<ul>
<li>Visible cable fraying or any strand breakage</li>
<li>Arms that no longer lock into position</li>
<li>Resistance that drops unexpectedly mid-set</li>
<li>Motor noise that is louder or different than normal</li>
<li>Error codes that return after restart</li>
</ul>
`,
  },
  {
    slug: 'suggested-weights',
    title: 'Suggested Weights',
    category: 'Getting Started',
    seoDescription: 'How Tonal Suggested Weights work, when to accept or override the suggestion, and how the AI learns your strength over time.',
    content: `
<h2>What Are Suggested Weights?</h2>
<p>Suggested Weights is Tonal's AI feature that recommends the resistance to use for each exercise at the start of every set. The suggestion is based on your recent performance history for that exercise, your general strength trajectory, and how much recovery time has passed since your last session.</p>

<h2>Where to Find the Suggestion</h2>
<p>When you navigate to any exercise, the weight selector screen will display a cyan highlighted number above the current weight. This is the suggested weight. You can accept it by tapping <strong>Use Suggested</strong> or manually adjust the weight before starting.</p>

<h2>When to Accept the Suggestion</h2>
<p>Accept the suggested weight when you are performing a routine training session and felt recovered going into the workout. Tonal's suggestions account for progressive overload and will gradually increase resistance over time as your performance data confirms readiness.</p>

<h2>When to Override the Suggestion</h2>
<ul>
<li>When returning from a break of more than 1 week. The suggestion may be higher than you can safely handle after time off.</li>
<li>When fatigued from a previous workout. Tonal does not always know your fatigue level going in.</li>
<li>When the exercise is a new movement you have not performed on Tonal before.</li>
</ul>

<h2>How the AI Learns</h2>
<p>Every completed rep at every weight is logged. Tonal measures your output, looks at how close you came to failure (using Spotter Mode data if enabled), and adjusts future suggestions accordingly. The more consistently you train on Tonal, the more accurate the suggestions become. Users who vary their weights unpredictably or frequently override suggestions without completing reps may experience less accurate recommendations.</p>
`,
  },
  {
    slug: 'in-workout-controls',
    title: 'In-Workout Controls',
    category: 'Getting Started',
    seoDescription: 'Guide to all the on-screen controls available during a Tonal workout, including adjusting weight, pausing, skipping exercises, and modifying rest time.',
    content: `
<h2>The In-Workout Interface</h2>
<p>During an active workout, Tonal's screen shows: the current exercise name and demonstration video, your rep counter, set progress, the current weight, and a timer for rest periods. Tap anywhere on the screen to reveal the control overlay.</p>

<h2>Adjusting Weight Mid-Set</h2>
<p>To change the resistance during a set, tap the weight display to bring up the weight adjustment wheel. Drag up to increase or down to decrease. The new weight takes effect immediately on the next rep. Weight changes made during a set are logged and inform future Suggested Weights.</p>

<h2>Pausing a Workout</h2>
<p>Tap the pause icon (two vertical bars) or tap anywhere on the screen and select <strong>Pause</strong>. Tonal will lower resistance to zero and pause all timers. Tap <strong>Resume</strong> to pick up where you left off. Workouts can be paused indefinitely but will auto-timeout if left paused for more than 30 minutes.</p>

<h2>Skipping an Exercise</h2>
<p>If you want to skip to the next exercise in the program, tap <strong>Skip Exercise</strong> from the workout controls menu. Skipped exercises are logged but do not contribute to set completion stats.</p>

<h2>Rest Timer Controls</h2>
<p>Between sets, Tonal shows a countdown rest timer. You can tap <strong>Skip Rest</strong> to start the next set immediately, or tap the timer display to add or reduce rest time in 15-second increments.</p>

<h2>Ending a Workout Early</h2>
<p>Tap the X icon in the top corner of the screen and select <strong>End Workout</strong>. Tonal will ask whether to save or discard the session. Partial workouts can be saved and are tracked in your history, though program completion percentage will reflect the incomplete session.</p>
`,
  },
  {
    slug: 'how-loud-is-tonal-during-a-workout',
    title: 'How Loud Is Tonal During a Workout?',
    category: 'Getting Started',
    seoDescription: 'Learn about Tonal noise levels during workouts, what sounds are normal, and when unusual sounds indicate a problem.',
    content: `
<h2>Normal Tonal Operating Sounds</h2>
<p>Tonal is not silent during use. Several sounds are completely normal during workouts:</p>
<ul>
<li><strong>Motor hum:</strong> A consistent, low-pitched hum from the resistance motor. This is present whenever resistance is active and is normal across the full weight range.</li>
<li><strong>Cable click:</strong> A soft click when the cable drum engages or disengages at the start and end of a set.</li>
<li><strong>Arm locking clicks:</strong> Clicking sounds when adjusting the arm height and it locks into position.</li>
<li><strong>Fan noise:</strong> Tonal has internal cooling fans that may be audible during high-load exercises or extended sessions.</li>
</ul>

<h2>Overall Volume Level</h2>
<p>Under normal use, Tonal is roughly as loud as a dishwasher or a quiet HVAC system — approximately 45 to 55 decibels at working distance. In a quiet room, the motor hum is noticeable but not disruptive. With music or a TV playing, most users do not notice the operational sound.</p>

<h2>When to Be Concerned About Noise</h2>
<p>The following sounds are not normal and may indicate a mechanical issue:</p>
<ul>
<li><strong>Grinding or squealing:</strong> May indicate cable wear, a debris obstruction in the cable path, or a bearing issue in the resistance motor.</li>
<li><strong>Loud clicking or popping during a set:</strong> Could indicate cable rub against the frame or a cable strand catching on a guide.</li>
<li><strong>Sudden increase in motor noise:</strong> Often a sign that the resistance motor is working harder than normal, possibly due to a cable tension problem.</li>
</ul>
<p>If you notice any of the above sounds, stop the workout and inspect the cables visually. 2EZ TEK provides Tonal diagnostic and repair service in Dallas Fort Worth for noise-related hardware issues.</p>
`,
  },

  // ── Features & Functions ──────────────────────────────────────────────────
  {
    slug: 'spotter-mode',
    title: 'Spotter Mode',
    category: 'Features & Functions',
    seoDescription: 'How Tonal Spotter Mode works, when it activates, and how it helps you train safely without a training partner.',
    content: `
<h2>What Is Spotter Mode?</h2>
<p>Spotter Mode is an AI feature that monitors your rep velocity in real time and automatically reduces resistance when it detects you are approaching failure. It acts as a digital spotter, catching the weight so you can push harder without the risk of being pinned under a heavy load.</p>

<h2>How to Enable Spotter Mode</h2>
<p>Spotter Mode is available for most exercises. To enable it, tap the <strong>Modes</strong> button on the exercise setup screen before starting a set and toggle Spotter Mode on. It can also be set as a default in <strong>Settings &gt; Workout Preferences</strong>.</p>

<h2>How Spotter Mode Works</h2>
<p>During a set, Tonal measures the time each rep takes to complete. As you fatigue, reps slow down. When your rep velocity drops below a threshold indicating you are close to failure, Tonal gradually reduces resistance — typically 10 to 30% — to help you complete the rep safely without dropping the weight.</p>

<h2>Best Exercises for Spotter Mode</h2>
<ul>
<li>Chest press and incline press</li>
<li>Shoulder press</li>
<li>Squats and goblet squats</li>
<li>Heavy rows</li>
</ul>
<p>Spotter Mode is particularly useful for unilateral exercises where one arm fatigues faster than the other, as Tonal can reduce resistance independently per arm.</p>
`,
  },
  {
    slug: 'chain-mode',
    title: 'Chain Mode',
    category: 'Features & Functions',
    seoDescription: 'Learn how Tonal Chain Mode mimics the feel of barbell chains by increasing resistance at the top of the movement.',
    content: `
<h2>What Is Chain Mode?</h2>
<p>Chain Mode mimics the effect of hanging chains from a barbell, a technique used by powerlifters to increase resistance through the strongest part of a lift. In Chain Mode, Tonal adds resistance progressively as you extend through the movement, so the weight is lighter at the bottom and heavier at the top.</p>

<h2>How to Use Chain Mode</h2>
<p>Select an exercise, tap <strong>Modes</strong> on the setup screen, and enable Chain Mode. Set your starting weight (the resistance at the bottom of the movement) and optionally adjust the chain multiplier percentage to control how much extra weight is added at full extension.</p>

<h2>Benefits of Chain Mode</h2>
<ul>
<li>Accommodating resistance matches your natural strength curve on pressing movements, reducing joint stress at the bottom while challenging you through lockout</li>
<li>Develops explosive power through the full range of motion</li>
<li>Eliminates the need to own actual barbell chains</li>
</ul>

<h2>Best Exercises for Chain Mode</h2>
<ul>
<li>Chest press and floor press</li>
<li>Squats</li>
<li>Deadlifts</li>
<li>Overhead press</li>
</ul>
`,
  },
  {
    slug: 'eccentric-mode',
    title: 'Eccentric Mode',
    category: 'Features & Functions',
    seoDescription: 'Learn how Tonal Eccentric Mode adds extra resistance on the lowering phase to build strength and muscle faster.',
    content: `
<h2>What Is Eccentric Mode?</h2>
<p>Eccentric Mode increases resistance during the lowering (eccentric) phase of an exercise. Because muscles are mechanically stronger during eccentric contractions than concentric ones, eccentric training allows you to handle more load during the lowering phase, creating greater muscle damage and stimulus for growth.</p>

<h2>How Eccentric Mode Works on Tonal</h2>
<p>When Eccentric Mode is enabled, Tonal increases resistance by a set percentage during the downward phase and returns to the standard programmed weight during the lifting phase. This is physically impossible with free weights but trivial for Tonal's digital resistance system to execute.</p>

<h2>How to Enable Eccentric Mode</h2>
<p>Tap <strong>Modes</strong> on any exercise setup screen and toggle Eccentric Mode on. Set your concentric weight and choose the eccentric multiplier (typically 10% to 30% above concentric weight to start).</p>

<h2>Research Behind Eccentric Training</h2>
<p>Eccentric training is well-documented in sports science as producing greater strength gains and muscle hypertrophy per session compared to standard concentric-only training. It is also used in physical therapy for treating tendinopathies and building joint stability.</p>

<h2>Best Exercises for Eccentric Mode</h2>
<ul>
<li>Bicep curls (slow negative phase)</li>
<li>Romanian deadlifts</li>
<li>Chest press</li>
<li>Lat pulldowns</li>
<li>Squats</li>
</ul>
`,
  },
  {
    slug: 'drop-sets',
    title: 'Drop Sets',
    category: 'Features & Functions',
    seoDescription: 'How to use Tonal Drop Sets to extend sets past failure by automatically reducing weight, maximizing muscle fatigue.',
    content: `
<h2>What Is a Drop Set?</h2>
<p>A drop set is a technique where you perform a set to failure, immediately reduce the weight by 10 to 30%, and continue repping until failure again — sometimes repeating this cycle 2 to 3 times. Drop sets create significant metabolic stress and muscle recruitment, making them a time-efficient way to push past normal rep thresholds.</p>

<h2>How Tonal Drop Sets Work</h2>
<p>Tonal automates the weight reduction so there is no delay between drops. When you approach failure and trigger the drop (or when Spotter Mode detects failure), Tonal drops the resistance to the preset level and you continue the set without releasing the handles or waiting for a weight change. A visual indicator on screen shows you which drop you are on.</p>

<h2>Setting Up Drop Sets on Tonal</h2>
<ol>
<li>On the exercise setup screen, tap <strong>Modes</strong>.</li>
<li>Toggle <strong>Drop Sets</strong> on.</li>
<li>Set the number of drops (1 to 3 recommended).</li>
<li>Set the weight reduction percentage per drop (typically 15% to 25%).</li>
<li>Complete your first set. Tonal will automatically reduce weight at failure.</li>
</ol>

<h2>Drop Set Not Triggering?</h2>
<p>If the Drop Set fails to activate automatically, verify that Spotter Mode is enabled alongside Drop Sets, as Spotter Mode provides the failure detection that triggers the drop. Manual Drop Sets can also be triggered by tapping the drop icon on screen during the set.</p>
`,
  },
  {
    slug: 'smart-flex',
    title: 'Smart Flex',
    category: 'Features & Functions',
    seoDescription: 'What is Tonal Smart Flex and how does it use your movement data to suggest workout modifications in real time.',
    content: `
<h2>What Is Smart Flex?</h2>
<p>Smart Flex is Tonal's adaptive workout AI that adjusts your program in real time based on your performance within a session. If you are performing significantly above or below your typical level in a workout, Smart Flex can recommend adjusting weights, reps, or exercise selection for subsequent exercises in the same session.</p>

<h2>How Smart Flex Adapts Your Workout</h2>
<p>Smart Flex analyzes your velocity, force output, and rep quality on early exercises in a session. If your performance indicates you are in an unusually strong state, it may suggest moving to a heavier variation or adding a set. If you are performing below baseline, it may recommend reducing volume or switching to a less fatiguing alternative exercise.</p>

<h2>How to Enable Smart Flex</h2>
<p>Smart Flex is available on select programs and sessions. When a session supports Smart Flex, a flex icon appears on the session detail screen. Toggle Smart Flex on before starting the workout. You can accept or decline each Smart Flex suggestion as it appears during the session.</p>

<h2>Smart Flex vs. Suggested Weights</h2>
<p>Suggested Weights recommends the weight to use before a set. Smart Flex is a broader program-level adjustment that may change the structure of the session based on intra-workout data. They complement each other — Suggested Weights sets your starting point and Smart Flex adapts the session as it unfolds.</p>
`,
  },
  {
    slug: 'tonal-coach-ai',
    title: 'Tonal Coach AI',
    category: 'Features & Functions',
    seoDescription: 'Overview of Tonal Coach AI, how it learns your fitness level, and what AI-powered coaching features are available during workouts.',
    content: `
<h2>What Is Tonal Coach AI?</h2>
<p>Tonal Coach AI is the umbrella name for the machine learning systems that power Tonal's adaptive training features. It encompasses Suggested Weights, Spotter Mode, Smart Flex, Eccentric Mode, and the general fitness intelligence that tracks your progress and adjusts programming over time.</p>

<h2>How Tonal Coach AI Learns Your Fitness</h2>
<p>Every rep you complete on Tonal is logged. The AI models track your force output, velocity, volume, rest patterns, and how close you come to failure on each set. Over months of data, the system builds an increasingly accurate model of your strength, recovery capacity, and response to different training stimuli.</p>

<h2>What Tonal Coach AI Influences</h2>
<ul>
<li>Starting weight suggestions for each exercise</li>
<li>When to increase resistance on a progressive overload schedule</li>
<li>Detecting fatigue and reducing resistance to prevent injury</li>
<li>Flagging unusually high or low performance sessions</li>
<li>Program recommendations based on your training history</li>
</ul>

<h2>Limitations</h2>
<p>Tonal Coach AI relies entirely on data generated on the Tonal platform. It does not know about gym sessions, sports activities, sleep quality, or nutrition. Providing honest input during your fitness profile setup and completing the assessment improves the AI's accuracy from day one.</p>
`,
  },

  // ── Account & Membership ──────────────────────────────────────────────────
  {
    slug: 'how-to-reset-your-tonal-password',
    title: 'How to Reset Your Tonal Password',
    category: 'Account & Membership',
    seoDescription: 'Step-by-step instructions for resetting your Tonal account password on the device, the app, or the Tonal website.',
    content: `
<h2>Reset Password from the Tonal Device</h2>
<ol>
<li>On the Tonal sign-in screen, tap <strong>Forgot Password</strong> beneath the password field.</li>
<li>Enter the email address associated with your Tonal account.</li>
<li>Tap <strong>Send Reset Link</strong>.</li>
<li>Check your email for a message from Tonal. The reset link expires after 24 hours.</li>
<li>Follow the link, create a new password, and then sign back in on the Tonal device.</li>
</ol>

<h2>Reset Password from the Tonal App</h2>
<ol>
<li>Open the Tonal mobile app and tap <strong>Sign In</strong>.</li>
<li>Tap <strong>Forgot Password</strong>.</li>
<li>Enter your email and tap <strong>Send Reset Link</strong>.</li>
<li>Complete the reset on the web and then sign back in to the app.</li>
</ol>

<h2>Password Requirements</h2>
<ul>
<li>Minimum 8 characters</li>
<li>At least one uppercase letter</li>
<li>At least one number or special character</li>
</ul>

<h2>Not Receiving the Reset Email?</h2>
<ul>
<li>Check your spam or junk folder</li>
<li>Verify you are using the email address linked to your Tonal account</li>
<li>Wait 5 minutes and request another reset link</li>
<li>If the problem persists, contact Tonal support to verify your account email</li>
</ul>
`,
  },
  {
    slug: 'cancel-your-tonal-membership',
    title: 'Cancel Your Tonal Membership',
    category: 'Account & Membership',
    seoDescription: 'How to cancel your Tonal membership, what happens to your data after cancellation, and options for pausing instead of canceling.',
    content: `
<h2>Before You Cancel</h2>
<p>Consider pausing your membership instead of canceling if you plan to return to Tonal training. Pausing maintains your workout history, Strength Score, and program progress. Canceling will disable AI features on the device and may affect your ability to access historical workout data.</p>

<h2>How to Cancel Your Tonal Membership</h2>
<ol>
<li>Open the Tonal mobile app or go to tonal.com and sign in.</li>
<li>Navigate to <strong>Account &gt; Membership</strong>.</li>
<li>Tap or click <strong>Cancel Membership</strong>.</li>
<li>Follow the prompts to confirm cancellation. You may be offered a pause option or a discounted rate before final confirmation.</li>
<li>Your membership remains active until the end of the current billing period.</li>
</ol>

<h2>What Happens After Cancellation</h2>
<ul>
<li>AI coaching features (Suggested Weights, Spotter Mode, Smart Flex) are disabled.</li>
<li>Access to live and on-demand classes is removed.</li>
<li>The Tonal hardware continues to function for local exercises using manual weight settings.</li>
<li>Your workout history and Strength Score are retained in your account.</li>
</ul>

<h2>Reactivating Your Membership</h2>
<p>To reactivate, sign back in to your account and select <strong>Reactivate Membership</strong> under Account settings. Your previous history and data will be restored.</p>
`,
  },
  {
    slug: 'add-or-switch-profiles',
    title: 'Add or Switch Profiles on the Device',
    category: 'Account & Membership',
    seoDescription: 'How to add household member profiles to Tonal and switch between profiles on the device screen.',
    content: `
<h2>Multiple Profiles on Tonal</h2>
<p>Tonal supports multiple user profiles under a single household membership. Each profile has its own Strength Score, workout history, program progress, and fitness settings. This allows multiple household members to use the same Tonal unit while keeping their data completely separate.</p>

<h2>How to Add a Profile</h2>
<ol>
<li>From the Tonal home screen, tap the profile icon in the top corner.</li>
<li>On the profile selection screen, tap <strong>Add Profile</strong>.</li>
<li>The new user can create a Tonal account with their own email address or sign in to an existing account.</li>
<li>The new profile will appear on the profile selection screen after setup.</li>
</ol>

<h2>How to Switch Profiles</h2>
<ol>
<li>Swipe down from the top of the screen and tap your profile icon, or return to the home screen and tap the profile area.</li>
<li>The profile selection screen appears. Tap the profile you want to switch to.</li>
<li>If Screen Lock is enabled for that profile, enter the PIN or scan the QR code.</li>
</ol>

<h2>Profile Limits</h2>
<p>A Tonal membership supports up to 4 active profiles on a single device. Each profile must be associated with a unique email address. Note that the primary account holder is responsible for the membership and billing regardless of which profile is in use.</p>
`,
  },
  {
    slug: 'pause-your-tonal-membership',
    title: 'Pause Your Tonal Membership',
    category: 'Account & Membership',
    seoDescription: 'How to pause your Tonal membership temporarily and what features remain available while paused.',
    content: `
<h2>When to Pause vs. Cancel</h2>
<p>Pausing your Tonal membership temporarily suspends billing while keeping your account, workout history, Strength Score, and program progress intact. This is the better option if you will be away from training for a defined period due to travel, injury, or seasonal schedule changes.</p>

<h2>How to Pause Your Membership</h2>
<ol>
<li>Open the Tonal app or sign in at tonal.com.</li>
<li>Go to <strong>Account &gt; Membership</strong>.</li>
<li>Tap <strong>Pause Membership</strong>.</li>
<li>Select the pause duration. Tonal typically offers pause options from 1 to 3 months.</li>
<li>Confirm the pause. Billing stops immediately and resumes automatically at the end of the pause period.</li>
</ol>

<h2>What Is Available During a Pause</h2>
<ul>
<li>The Tonal hardware continues to function for manual-weight exercises.</li>
<li>Your account and all data remain active.</li>
<li>AI coaching features and live/on-demand classes are suspended during the pause.</li>
</ul>

<h2>Resuming Early</h2>
<p>To resume your membership before the pause period ends, go to <strong>Account &gt; Membership</strong> and tap <strong>Resume Membership</strong>. Billing will restart from the resume date and all features will be restored immediately.</p>
`,
  },

  // ── Troubleshooting articles ──────────────────────────────────────────────
  {
    slug: 'cable-walk-out',
    title: 'Cable Walk-Out',
    category: 'Troubleshooting',
    seoDescription: 'Step-by-step guide to performing a Tonal cable walk-out, when it is required, and what to do if the prompt keeps returning.',
    content: `
<h2>What Is a Cable Walk-Out?</h2>
<p>A cable walk-out is a calibration procedure that fully extends both cables to reset the drum tension and position counters inside Tonal. The system tracks how far each cable has been pulled out over time, and when the internal count drifts from the actual cable position, Tonal requires a walk-out to re-sync.</p>

<h2>When Is a Cable Walk-Out Required?</h2>
<ul>
<li>When Tonal displays a cable walk-out prompt on the home screen or before starting a workout</li>
<li>After a power outage or abrupt power loss during a workout</li>
<li>After replacing a cable or arm component</li>
<li>When resistance feels inconsistent or drops unexpectedly mid-set</li>
</ul>

<h2>How to Perform a Cable Walk-Out</h2>
<ol>
<li>From the home screen, tap <strong>Start Walk-Out</strong> when prompted. If not prompted, go to <strong>Settings &gt; Device &gt; Cable Walk-Out</strong>.</li>
<li>Grip the left cable handle and slowly pull the cable to full extension. Hold for 3 seconds.</li>
<li>Gently return the left arm to the stowed position without letting the cable snap back.</li>
<li>Repeat the same process for the right cable arm.</li>
<li>Tonal will display a completion confirmation. The walk-out is now complete.</li>
</ol>

<h2>Walk-Out Prompt Keeps Returning</h2>
<p>If the cable walk-out prompt reappears after completing the procedure correctly, this indicates a hardware issue: a cable drum sensor fault, a cable that is longer or shorter than the system expects, or internal tension mechanism wear. 2EZ TEK provides Tonal cable system diagnostics and repair in Dallas Fort Worth. Contact us for a same-week service appointment.</p>
`,
  },
  {
    slug: 'cross-linked-arms',
    title: 'Cross-Linked Arms',
    category: 'Troubleshooting',
    seoDescription: 'How to fix Tonal cross-linked arms showing reversed resistance values or mixed left/right readings.',
    content: `
<h2>What Does "Cross-Linked Arms" Mean?</h2>
<p>Cross-linked arms is a condition where Tonal's left arm sensor reads data from the right arm and vice versa. Symptoms include reversed resistance values, exercises showing unequal loading when you know your effort is balanced, or the on-screen indicators showing the wrong arm as dominant.</p>

<h2>Common Causes</h2>
<ul>
<li>Bluetooth arm pairing reset during a firmware update</li>
<li>Interference from other Bluetooth devices near Tonal</li>
<li>A factory reset that cleared arm pairing data</li>
<li>Physical swap of arm positions during relocation</li>
</ul>

<h2>How to Fix Cross-Linked Arms</h2>
<ol>
<li>Perform a full Tonal restart: hold the rear power button for 10 seconds until the screen goes dark, then power back on.</li>
<li>If the issue persists, go to <strong>Settings &gt; Device &gt; Link Arms</strong>.</li>
<li>Follow the on-screen arm linking procedure. Extend each arm when prompted and hold for 3 seconds to allow Tonal to assign left and right designations.</li>
<li>Perform a cable walk-out after re-linking to ensure tension calibration is complete.</li>
</ol>

<h2>Still Cross-Linked After Re-Linking?</h2>
<p>Persistent cross-linking after multiple re-link attempts may indicate a hardware fault in an arm's Bluetooth module or a main board pairing table issue. 2EZ TEK provides Tonal arm diagnostic and repair service in the Dallas Fort Worth area.</p>
`,
  },
  {
    slug: 'arm-batteries-replacement-guide',
    title: 'Arm Batteries: Replacement Guide',
    category: 'Troubleshooting',
    seoDescription: 'How to replace the batteries in Tonal arms, the correct battery type, and what to do when arms stop responding after a battery swap.',
    content: `
<h2>Do Tonal Arms Have Replaceable Batteries?</h2>
<p>Yes. Each Tonal arm contains a battery that powers the Bluetooth sensor module responsible for communicating position and resistance data to the main unit. When the battery is low, the arm may disconnect intermittently, show incorrect resistance readings, or fail to respond to commands.</p>

<h2>Battery Type</h2>
<p>Tonal arms use CR2032 lithium coin cell batteries. This is a standard size available at most hardware, electronics, and grocery stores. Tonal recommends using a reputable brand such as Energizer or Duracell for longest service life.</p>

<h2>How to Replace Arm Batteries</h2>
<ol>
<li>Power off Tonal using the rear power button.</li>
<li>Locate the battery compartment on the underside of each arm, near the stow locking mechanism. Open the compartment cover using a small flathead screwdriver or a coin.</li>
<li>Remove the old battery. Note the orientation (positive side up).</li>
<li>Insert the new CR2032 battery positive side up. Do not force the cover closed if the battery is not seated correctly.</li>
<li>Close the compartment cover and power Tonal back on.</li>
<li>If arm pairing is lost after the battery swap, go to <strong>Settings &gt; Device &gt; Link Arms</strong> to re-pair.</li>
</ol>

<h2>Arms Not Responding After Battery Swap</h2>
<p>If an arm fails to communicate after a battery replacement, verify polarity is correct and the battery is making full contact with both terminals. If the arm still does not respond after a second battery swap and re-link attempt, the arm sensor module may have failed. Contact 2EZ TEK in Dallas Fort Worth for a service inspection.</p>
`,
  },
  {
    slug: 'arm-rotation-issues',
    title: 'Arm Rotation Issues',
    category: 'Troubleshooting',
    seoDescription: 'How to troubleshoot Tonal arms that are stuck, not rotating freely, or need sensor recalibration.',
    content: `
<h2>What Is Tonal Arm Rotation?</h2>
<p>Tonal arms rotate vertically to multiple locking positions, allowing you to set the cable attachment point at different heights for different exercises. The rotation mechanism uses a spring-loaded locking pin that engages notches in the arm's adjustment rail.</p>

<h2>Common Arm Rotation Problems</h2>
<ul>
<li><strong>Arm stuck at one position:</strong> The locking pin is jammed or debris has entered the adjustment rail.</li>
<li><strong>Arm skips positions:</strong> The locking pin spring is worn and not engaging consistently.</li>
<li><strong>Arm falls to lowest position under load:</strong> The pin is not fully engaged or the rail notch is worn.</li>
<li><strong>Arm rotates freely with no resistance:</strong> The pin has disengaged from the rail entirely.</li>
</ul>

<h2>How to Troubleshoot Arm Rotation</h2>
<ol>
<li>Make sure Tonal is powered off before working on the arm mechanism.</li>
<li>Inspect the adjustment rail for visible debris, rust, or damage. Clear any obstruction with a soft cloth.</li>
<li>Apply a small amount of dry lubricant (PTFE spray) to the rail if the arm feels stiff but the rail is clean. Do not use wet lubricants that can attract dust.</li>
<li>Test each position by lifting the arm while pressing it toward the Tonal body. Each position should click firmly.</li>
</ol>

<h2>When to Call a Technician</h2>
<p>If an arm continues to skip positions, fall under load, or will not lock into any position after the above steps, the internal locking mechanism requires professional service. 2EZ TEK repairs Tonal arm assemblies in Dallas Fort Worth — contact us before the situation becomes a safety hazard.</p>
`,
  },
  {
    slug: 'tonal-will-not-turn-on',
    title: 'Tonal Will Not Turn On',
    category: 'Troubleshooting',
    seoDescription: 'Troubleshooting guide for a Tonal that will not power on, including power checks, force restart, and when to call a technician.',
    content: `
<h2>Before Assuming Hardware Failure</h2>
<p>A Tonal that will not turn on is often a power delivery issue rather than a hardware failure. Work through these steps in order before concluding the unit has failed.</p>

<h2>Step 1: Check the Power Supply</h2>
<ul>
<li>Verify the power cord is firmly seated in both the wall outlet and the Tonal power port. Both ends can loosen from vibration over time.</li>
<li>Test the outlet by plugging in a different device. If that device also has no power, the circuit breaker may have tripped.</li>
<li>Avoid using a power strip or surge protector. Tonal recommends a direct outlet connection.</li>
</ul>

<h2>Step 2: Try a Force Restart</h2>
<p>Press and hold the power button on the back of Tonal for 10 seconds. Wait 30 seconds, then press the button again for 2 seconds to power on. The screen should show the Tonal logo within 20 to 30 seconds.</p>

<h2>Step 3: Check for Overheating</h2>
<p>Tonal has thermal protection that shuts the unit down if it overheats. If the unit was used heavily and then refused to turn on, allow it to cool for 20 to 30 minutes in a room-temperature environment and then retry the power button.</p>

<h2>Step 4: Contact 2EZ TEK</h2>
<p>If none of the above steps restore power, the issue is likely internal — a failed power board, a tripped internal fuse, or a main board failure. 2EZ TEK provides Tonal diagnostics and power system repair in Dallas Fort Worth. Contact us for a same-week service visit.</p>
`,
  },
  {
    slug: 'wifi-connectivity',
    title: 'WiFi Connectivity Troubleshooting',
    category: 'Troubleshooting',
    seoDescription: 'Fix Tonal WiFi connection problems including not connecting, dropping mid-workout, and switching to a new router.',
    content: `
<h2>Tonal WiFi Requirements</h2>
<p>Tonal requires a 2.4 GHz or 5 GHz WiFi connection with at least 5 Mbps of dedicated bandwidth for smooth streaming during workouts. Tonal does not support captive portal networks (hotel or office WiFi that requires a browser login) without special configuration.</p>

<h2>Tonal Not Connecting to WiFi</h2>
<ol>
<li>Go to <strong>Settings &gt; WiFi</strong> on Tonal.</li>
<li>Select your network name. If it does not appear, check that your router is broadcasting on a standard home channel.</li>
<li>Enter your WiFi password carefully — WiFi passwords are case-sensitive.</li>
<li>If connection fails, restart your router by unplugging it for 30 seconds, then retry.</li>
</ol>

<h2>Dropping Connection During Workouts</h2>
<ul>
<li><strong>Signal strength:</strong> Tonal needs at least a good signal (-60 dBm or better). Move your router closer or add a mesh node near the Tonal.</li>
<li><strong>Channel congestion:</strong> In apartment buildings with many WiFi networks, switch your router to a less-crowded channel (channels 1, 6, or 11 on 2.4 GHz).</li>
<li><strong>Interference:</strong> Microwave ovens, baby monitors, and other 2.4 GHz devices can cause dropouts. Try switching Tonal to the 5 GHz band if available.</li>
</ul>

<h2>Switching to a New Router</h2>
<ol>
<li>On Tonal, go to <strong>Settings &gt; WiFi</strong>.</li>
<li>Tap the currently connected network and select <strong>Forget Network</strong>.</li>
<li>Select your new network name and enter the password.</li>
</ol>
`,
  },
]

export function getArticleBySlug(slug: string): TonalArticle | undefined {
  return TONAL_ARTICLES.find((a) => a.slug === slug)
}

export function getArticlesByCategory(category: string): TonalArticle[] {
  return TONAL_ARTICLES.filter((a) => a.category === category)
}
