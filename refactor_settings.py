import re

file_path = 'e:/projects/Dashboard/src/pages/Settings/SettingsPage.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove the useEffect auto-save block
content = re.sub(r'  // Auto-save visual & layout settings for instant preview.*?\]\);\n\n', '', content, flags=re.DOTALL)

# 2. For each visual state, remove the useState declaration and replace usages with direct updateSettings calls
# We'll just manually replace the useState blocks and the corresponding onChange/onClick handlers.
# Actually, since there are many, it's easier to just write the new file content directly or use regex carefully.

# Let's replace the useState declarations
state_vars = [
    'animationSpeed', 'scrollAnimationsEnabled', 'scrollAnimationIntensity', 'themeMode', 'accentColor',
    'dashboardWidgets', 'sidebarPages', 'glassIntensity', 'layoutSpacing', 'typography',
    'dashboardBgType', 'dashboardBgPreset', 'dashboardBgCustomUrl', 'currency', 'dateFormat'
]

for var in state_vars:
    # Remove useState declaration
    content = re.sub(fr'  const \[{var}, set{var[0].upper() + var[1:]}\] = useState\(.*?\);\n', '', content)
    
    # Replace variable usage with settings.var (e.g. themeMode -> settings.themeMode)
    # Be careful not to replace it inside property keys or updateSettings({ themeMode })
    # We will just replace specific patterns
    content = re.sub(fr'\b{var}\b(?!:)', f'settings.{var}', content)
    
    # Replace setVar with updateSettings
    set_func = f'set{var[0].upper() + var[1:]}'
    if var in ['dashboardWidgets', 'sidebarPages']:
        # e.g. setDashboardWidgets({...dashboardWidgets, [widgetKey]: !dashboardWidgets[widgetKey]})
        # -> updateSettings({ dashboardWidgets: {...settings.dashboardWidgets, [widgetKey]: !settings.dashboardWidgets[widgetKey]} })
        pass # we'll handle this manually below
    else:
        # e.g. setTypography(e.target.value) -> updateSettings({ typography: e.target.value })
        content = re.sub(fr'{set_func}\((.*?)\)', fr'updateSettings({{ {var}: \1 }})', content)

# Fix dashboardWidgets and sidebarPages manual toggle logic
content = re.sub(r'setDashboardWidgets\(\{.*?\[widgetKey\]: !settings\.dashboardWidgets\[widgetKey\]\}\)', 
                 r'updateSettings({ dashboardWidgets: { ...settings.dashboardWidgets, [widgetKey]: !settings.dashboardWidgets[widgetKey] } })', content)
content = re.sub(r'setSidebarPages\(\{.*?\[pageKey\]: !settings\.sidebarPages\[pageKey\]\}\)', 
                 r'updateSettings({ sidebarPages: { ...settings.sidebarPages, [pageKey]: !settings.sidebarPages[pageKey] } })', content)

# Fix the handleSaveProfile which now uses settings.* for visual settings
content = re.sub(r'updateSettings\(\{ \n      name, pomodoroWork, pomodoroBreak, notifications, settings\.animationSpeed,', 
                 r'updateSettings({ \n      name, pomodoroWork, pomodoroBreak, notifications,', content)

# We need to make sure we didn't break updateSettings({ settings.themeMode... })
# Let's just rewrite the handleSaveProfile
handle_save_orig = """  const handleSaveProfile = () => {
    updateSettings({ 
      name, pomodoroWork, pomodoroBreak, notifications, settings.animationSpeed,
      settings.scrollAnimationsEnabled, settings.scrollAnimationIntensity, settings.themeMode, settings.accentColor, settings.dashboardWidgets, settings.sidebarPages,
      settings.glassIntensity, settings.layoutSpacing, settings.typography, settings.dashboardBgType, settings.dashboardBgPreset, settings.dashboardBgCustomUrl,
      settings.currency, settings.dateFormat
    });
    // Show a small toast or just assume saved
  };"""
handle_save_new = """  const handleSaveProfile = () => {
    updateSettings({ 
      name, pomodoroWork, pomodoroBreak, notifications
    });
    // Show a small toast or just assume saved
  };"""
content = content.replace(handle_save_orig, handle_save_new)

# Fix the import
content = content.replace("import { useState, useEffect } from 'react';", "import { useState } from 'react';")

# Fix settings.settings.
content = content.replace("settings.settings.", "settings.")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("SettingsPage.jsx rewritten")
