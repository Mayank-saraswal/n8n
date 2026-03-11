"use client"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useTRPC } from "@/trpc/client"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

type RepeatMode = "everyMinute" | "everyHour" | "everyDay" | "everyWeek" | "everyMonth"

const CRON_PRESETS = [
  { label: "Every minute",        value: "* * * * *",     repeatMode: "everyMinute" as RepeatMode, hour: 9,  minute: 0,  days: [1,2,3,4,5], monthDay: 1 },
  { label: "Every 5 minutes",     value: "*/5 * * * *",   repeatMode: "everyMinute" as RepeatMode, hour: 9,  minute: 0,  days: [1,2,3,4,5], monthDay: 1 },
  { label: "Every 15 minutes",    value: "*/15 * * * *",  repeatMode: "everyMinute" as RepeatMode, hour: 9,  minute: 0,  days: [1,2,3,4,5], monthDay: 1 },
  { label: "Every hour",          value: "0 * * * *",     repeatMode: "everyHour" as RepeatMode,   hour: 9,  minute: 0,  days: [1,2,3,4,5], monthDay: 1 },
  { label: "Every day at 9am",    value: "0 9 * * *",     repeatMode: "everyDay" as RepeatMode,    hour: 9,  minute: 0,  days: [1,2,3,4,5], monthDay: 1 },
  { label: "Every Monday 9am",    value: "0 9 * * 1",     repeatMode: "everyWeek" as RepeatMode,   hour: 9,  minute: 0,  days: [1],          monthDay: 1 },
  { label: "Every weekday 9am",   value: "0 9 * * 1-5",   repeatMode: "everyWeek" as RepeatMode,   hour: 9,  minute: 0,  days: [1,2,3,4,5], monthDay: 1 },
  { label: "First of month",      value: "0 0 1 * *",     repeatMode: "everyMonth" as RepeatMode,  hour: 0,  minute: 0,  days: [1,2,3,4,5], monthDay: 1 },
] as const

const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"] as const

const COMMON_TIMEZONES = [
    "UTC",
    "Asia/Kolkata",
    "America/New_York",
    "America/Los_Angeles",
    "Europe/London",
    "Asia/Tokyo",
    "Australia/Sydney",
]

function getAllTimezones(): string[] {
    try {
        return Intl.supportedValuesOf("timeZone")
    } catch {
        return COMMON_TIMEZONES
    }
}

function buildCronExpression(
    repeatMode: RepeatMode,
    minute: number,
    hour: number,
    selectedDays: number[],
    monthDay: number
): string {
    switch (repeatMode) {
        case "everyMinute": return "* * * * *"
        case "everyHour":   return `${minute} * * * *`
        case "everyDay":    return `${minute} ${hour} * * *`
        case "everyWeek": {
            const days = [...selectedDays].sort((a, b) => a - b).join(",")
            return `${minute} ${hour} * * ${days || "*"}`
        }
        case "everyMonth":  return `${minute} ${hour} ${monthDay} * *`
        default:            return `${minute} ${hour} * * *`
    }
}

function getHumanReadable(
    repeatMode: RepeatMode,
    minute: number,
    hour: number,
    selectedDays: number[],
    monthDay: number
): string {
    const timeStr = `${hour.toString().padStart(2,"0")}:${minute.toString().padStart(2,"0")}`

    switch (repeatMode) {
        case "everyMinute": return "Every minute"
        case "everyHour":   return `Every hour at :${minute.toString().padStart(2,"0")}`
        case "everyDay":    return `Every day at ${timeStr}`
        case "everyWeek": {
            const dayNames = [...selectedDays].sort((a, b) => a - b).map(d => DAY_NAMES[d]).join(", ")
            return `Every ${dayNames || "week"} at ${timeStr}`
        }
        case "everyMonth":  return `On day ${monthDay} of every month at ${timeStr}`
        default:            return `At ${timeStr}`
    }
}

function parseCronToVisualState(cron: string): {
    repeatMode: RepeatMode
    minute: number
    hour: number
    selectedDays: number[]
    monthDay: number
} | null {
    const parts = cron.trim().split(/\s+/)
    if (parts.length !== 5) return null

    const [minPart, hourPart, dayOfMonthPart, , dayOfWeekPart] = parts

    if (minPart === "*" && hourPart === "*" && dayOfMonthPart === "*" && dayOfWeekPart === "*") {
        return { repeatMode: "everyMinute", minute: 0, hour: 9, selectedDays: [1,2,3,4,5], monthDay: 1 }
    }

    const min = parseInt(minPart, 10)
    if (isNaN(min) || min < 0 || min > 59) return null

    if (hourPart === "*" && dayOfMonthPart === "*" && dayOfWeekPart === "*") {
        return { repeatMode: "everyHour", minute: min, hour: 9, selectedDays: [1,2,3,4,5], monthDay: 1 }
    }

    const hr = parseInt(hourPart, 10)
    if (isNaN(hr) || hr < 0 || hr > 23) return null

    if (dayOfMonthPart !== "*" && dayOfWeekPart === "*") {
        const dom = parseInt(dayOfMonthPart, 10)
        if (!isNaN(dom) && dom >= 1 && dom <= 31) {
            return { repeatMode: "everyMonth", minute: min, hour: hr, selectedDays: [1,2,3,4,5], monthDay: dom }
        }
        return null
    }

    if (dayOfMonthPart === "*" && dayOfWeekPart !== "*") {
        const days = dayOfWeekPart.split(",").flatMap(part => {
            const rangeMatch = part.match(/^(\d)-(\d)$/)
            if (rangeMatch) {
                const start = parseInt(rangeMatch[1], 10)
                const end = parseInt(rangeMatch[2], 10)
                const result: number[] = []
                for (let i = start; i <= end; i++) result.push(i)
                return result
            }
            const num = parseInt(part, 10)
            return isNaN(num) ? [] : [num]
        })
        if (days.length > 0 && days.every(d => d >= 0 && d <= 6)) {
            return { repeatMode: "everyWeek", minute: min, hour: hr, selectedDays: days, monthDay: 1 }
        }
        return null
    }

    if (dayOfMonthPart === "*" && dayOfWeekPart === "*") {
        return { repeatMode: "everyDay", minute: min, hour: hr, selectedDays: [1,2,3,4,5], monthDay: 1 }
    }

    return null
}

interface Props{
    open:boolean
    onOpenChange:(open:boolean)=>void
}

export const ScheduleTriggerDialog =({
    open,
    onOpenChange,
}:Props)=>{

    const params = useParams();
    const workflowId = params.workflowId as string;
    const trpc = useTRPC();

    const [cronExpression, setCronExpression] = useState("0 9 * * *")
    const [timezone, setTimezone] = useState("UTC")
    const [isSaved, setIsSaved] = useState(false)

    const [repeatMode, setRepeatMode] = useState<RepeatMode>("everyDay")
    const [hour, setHour] = useState(9)
    const [minute, setMinute] = useState(0)
    const [selectedDays, setSelectedDays] = useState<number[]>([1,2,3,4,5])
    const [monthDay, setMonthDay] = useState(1)

    const [activeTab, setActiveTab] = useState("visual")
    const [customCron, setCustomCron] = useState("0 9 * * *")
    const [parseError, setParseError] = useState<string | null>(null)

    const allTimezones = useMemo(() => getAllTimezones(), [])

    const { data: scheduleTrigger } = useQuery(
        trpc.scheduleTrigger.getByWorkflowId.queryOptions(
            { workflowId },
            { enabled: open }
        )
    );

    useEffect(() => {
        if (scheduleTrigger) {
            setCronExpression(scheduleTrigger.cronExpression)
            setTimezone(scheduleTrigger.timezone)
            setCustomCron(scheduleTrigger.cronExpression)
            const parsed = parseCronToVisualState(scheduleTrigger.cronExpression)
            if (parsed) {
                setRepeatMode(parsed.repeatMode)
                setHour(parsed.hour)
                setMinute(parsed.minute)
                setSelectedDays(parsed.selectedDays)
                setMonthDay(parsed.monthDay)
            }
        }
    }, [scheduleTrigger])

    const visualCron = useMemo(
        () => buildCronExpression(repeatMode, minute, hour, selectedDays, monthDay),
        [repeatMode, minute, hour, selectedDays, monthDay]
    )

    const humanReadable = useMemo(
        () => getHumanReadable(repeatMode, minute, hour, selectedDays, monthDay),
        [repeatMode, minute, hour, selectedDays, monthDay]
    )

    useEffect(() => {
        if (activeTab === "visual") {
            setCronExpression(visualCron)
            setCustomCron(visualCron)
        }
    }, [visualCron, activeTab])

    const handleTabChange = useCallback((value: string) => {
        if (value === "visual") {
            const parsed = parseCronToVisualState(customCron)
            if (parsed) {
                setRepeatMode(parsed.repeatMode)
                setHour(parsed.hour)
                setMinute(parsed.minute)
                setSelectedDays(parsed.selectedDays)
                setMonthDay(parsed.monthDay)
                setParseError(null)
                setActiveTab("visual")
            } else {
                setParseError("Cannot parse this cron expression into visual builder. Please edit it manually.")
            }
        } else {
            setCustomCron(cronExpression)
            setParseError(null)
            setActiveTab("custom")
        }
    }, [customCron, cronExpression])

    const handleCustomCronChange = useCallback((value: string) => {
        setCustomCron(value)
        setCronExpression(value)
        setIsSaved(false)
        setParseError(null)
    }, [])

    const toggleDay = useCallback((day: number) => {
        setSelectedDays(prev =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        )
        setIsSaved(false)
    }, [])

    const handlePresetClick = useCallback((preset: typeof CRON_PRESETS[number]) => {
        setRepeatMode(preset.repeatMode)
        setHour(preset.hour)
        setMinute(preset.minute)
        setSelectedDays([...preset.days])
        setMonthDay(preset.monthDay)
        setCronExpression(preset.value)
        setCustomCron(preset.value)
        setIsSaved(false)
        setActiveTab("visual")
    }, [])

    const isValidCron = /^(\S+\s){4}\S+$/.test(cronExpression.trim())

    const saveSchedule = useMutation(
        trpc.scheduleTrigger.createOrUpdateScheduleTrigger.mutationOptions({
            onSuccess: () => {
                setIsSaved(true)
                toast.success("Schedule saved")
            },
            onError: () => toast.error("Failed to save schedule"),
        })
    )

    return(
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Schedule Trigger Configuration</DialogTitle>
                    <DialogDescription>
                        Configure a cron schedule to run this workflow automatically on a time-based schedule
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="flex-1 overflow-y-auto pr-2">
                <div className="space-y-4">
                    <Tabs value={activeTab} onValueChange={handleTabChange}>
                        <TabsList className="w-full">
                            <TabsTrigger value="visual" className="flex-1">Visual Builder</TabsTrigger>
                            <TabsTrigger value="custom" className="flex-1">Custom Expression</TabsTrigger>
                        </TabsList>

                        <TabsContent value="visual" className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label>Run this workflow...</Label>
                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <Label htmlFor="repeat-mode" className="text-xs text-muted-foreground">Repeat</Label>
                                        <Select value={repeatMode} onValueChange={(v: RepeatMode) => { setRepeatMode(v); setIsSaved(false) }}>
                                            <SelectTrigger id="repeat-mode" className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="everyMinute">Every Minute</SelectItem>
                                                <SelectItem value="everyHour">Every Hour</SelectItem>
                                                <SelectItem value="everyDay">Every Day</SelectItem>
                                                <SelectItem value="everyWeek">Every Week</SelectItem>
                                                <SelectItem value="everyMonth">Every Month</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {repeatMode !== "everyMinute" && (
                                        <div className="space-y-1">
                                            <Label className="text-xs text-muted-foreground">
                                                {repeatMode === "everyHour" ? "At minute" : "Time"}
                                            </Label>
                                            <div className="flex items-center gap-1">
                                                {repeatMode !== "everyHour" && (
                                                    <>
                                                        <Select value={hour.toString()} onValueChange={(v) => { setHour(parseInt(v, 10)); setIsSaved(false) }}>
                                                            <SelectTrigger className="w-[70px]">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {Array.from({length: 24}, (_, i) => (
                                                                    <SelectItem key={i} value={i.toString()}>
                                                                        {i.toString().padStart(2, "0")}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <span className="text-sm font-medium">:</span>
                                                    </>
                                                )}
                                                <Select value={minute.toString()} onValueChange={(v) => { setMinute(parseInt(v, 10)); setIsSaved(false) }}>
                                                    <SelectTrigger className="w-[70px]">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Array.from({length: 60}, (_, i) => (
                                                            <SelectItem key={i} value={i.toString()}>
                                                                {i.toString().padStart(2, "0")}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    )}

                                    {repeatMode === "everyWeek" && (
                                        <div className="space-y-1">
                                            <Label className="text-xs text-muted-foreground">On days</Label>
                                            <div className="flex gap-1 flex-wrap">
                                                {DAY_NAMES.map((name, index) => (
                                                    <Button
                                                        key={name}
                                                        type="button"
                                                        size="sm"
                                                        variant={selectedDays.includes(index) ? "default" : "outline"}
                                                        className="min-w-[42px] text-xs"
                                                        onClick={() => toggleDay(index)}
                                                    >
                                                        {name}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {repeatMode === "everyMonth" && (
                                        <div className="space-y-1">
                                            <Label className="text-xs text-muted-foreground">On day of month</Label>
                                            <Select value={monthDay.toString()} onValueChange={(v) => { setMonthDay(parseInt(v, 10)); setIsSaved(false) }}>
                                                <SelectTrigger className="w-[80px]">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Array.from({length: 31}, (_, i) => (
                                                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                                                            {i + 1}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="rounded-lg bg-muted p-3 space-y-1">
                                <p className="text-sm font-medium">Preview: {humanReadable}</p>
                                <p className="text-xs text-muted-foreground font-mono">Cron: {visualCron}</p>
                            </div>
                        </TabsContent>

                        <TabsContent value="custom" className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label htmlFor="cron-expression">
                                    Cron Expression
                                </Label>
                                <Input
                                    id="cron-expression"
                                    value={customCron}
                                    onChange={(e) => handleCustomCronChange(e.target.value)}
                                    placeholder="0 9 * * *"
                                    className="font-mono text-sm"
                                />
                                {!isValidCron && cronExpression.trim() !== "" && (
                                    <p className="text-sm text-destructive">
                                        Invalid cron expression. Must have 5 space-separated fields.
                                    </p>
                                )}
                                {parseError && (
                                    <p className="text-sm text-destructive">
                                        {parseError}
                                    </p>
                                )}
                                <p className="text-sm text-muted-foreground">
                                    Expression: <code className="font-mono">{cronExpression}</code>
                                </p>
                            </div>
                        </TabsContent>
                    </Tabs>

                    <div className="space-y-2">
                        <Label htmlFor="timezone">
                            Timezone
                        </Label>
                        <Select value={timezone} onValueChange={(v) => { setTimezone(v); setIsSaved(false) }}>
                            <SelectTrigger id="timezone" className="w-full">
                                <SelectValue placeholder="Select timezone" />
                            </SelectTrigger>
                            <SelectContent>
                                {COMMON_TIMEZONES.map(tz => (
                                    <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                                ))}
                                <SelectItem disabled value="---">──────────</SelectItem>
                                {allTimezones.filter(tz => !COMMON_TIMEZONES.includes(tz)).map(tz => (
                                    <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                   <div className="rounded-lg bg-muted p-4 space-y-2">
                    <h4 className="font-medium text-sm">
                        Cron Presets:
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                        {CRON_PRESETS.map((preset)=>(
                            <Button
                                key={preset.value}
                                type="button"
                                variant="outline"
                                size="sm"
                                className="justify-start text-xs"
                                onClick={() => handlePresetClick(preset)}
                            >
                                {preset.label}
                            </Button>
                        ))}
                    </div>
                   </div>
                    <Button
                        onClick={() => saveSchedule.mutate({ workflowId, cronExpression, timezone })}
                        disabled={!isValidCron || saveSchedule.isPending}
                        className="w-full"
                    >
                        {saveSchedule.isPending ? "Saving..." : isSaved ? "Saved ✓" : "Save Schedule"}
                    </Button>
                   <div className="rounded-lg bg-muted p-4 space-y-2">
                    <h4 className="font-medium text-sm">
                        Setup instructions:
                    </h4>
                    <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                        <li>Select a cron preset above or use a custom expression</li>
                        <li>The workflow will run automatically on the configured schedule</li>
                        <li>All times are in UTC by default</li>
                        <li>You can toggle the schedule on/off at any time</li>
                    </ol>
                   </div>
                    <div className="rounded-lg bg-muted p-4 space-y-2">
                        <h4 className="font-medium text-sm"> Available Variables</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            <li>
                                <code className="bg-background px-1 py-0.5 rounded">
                                    {"{{schedule.firedAt}}"}
                                </code>
                                - When the schedule fired (ISO timestamp)
                            </li>
                              <li>
                                <code className="bg-background px-1 py-0.5 rounded">
                                    {"{{schedule.workflowId}}"}
                                </code>
                                - Workflow ID
                            </li>
                              <li>
                                <code className="bg-background px-1 py-0.5 rounded">
                                    {"{{json schedule}}"}
                                </code>
                                - Full schedule data as JSON
                            </li>
                        </ul>
                    </div>
                </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
