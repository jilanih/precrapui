"use client"

import { createContext, useContext, useState, ReactNode } from 'react'

interface WorkflowContextType {
  refreshData: () => void
  clearAllData: () => void
  setRefreshData: (fn: () => void) => void
  setClearAllData: (fn: () => void) => void
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined)

export function WorkflowProvider({ children }: { children: ReactNode }) {
  const [refreshData, setRefreshDataState] = useState<() => void>(() => () => {})
  const [clearAllData, setClearAllDataState] = useState<() => void>(() => () => {})

  const setRefreshData = (fn: () => void) => {
    setRefreshDataState(() => fn)
  }

  const setClearAllData = (fn: () => void) => {
    setClearAllDataState(() => fn)
  }

  return (
    <WorkflowContext.Provider value={{ refreshData, clearAllData, setRefreshData, setClearAllData }}>
      {children}
    </WorkflowContext.Provider>
  )
}

export function useWorkflow() {
  const context = useContext(WorkflowContext)
  if (context === undefined) {
    throw new Error('useWorkflow must be used within a WorkflowProvider')
  }
  return context
}
