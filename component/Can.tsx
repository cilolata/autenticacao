import { ReactNode } from "react";
import { UseCan } from "../hooks/useCan";

interface CanProps {
    children: ReactNode
    permissions?: string[]
    roles?: string[]
}

export function Can({children, permissions, roles}: CanProps){
    const userCanSeeComponent = UseCan({permissions, roles})

    if(!userCanSeeComponent){
        return null
    }

    return (
        <>
        {children}
        </>
    )
}