interface NodePalette {
    id: string;
    type: string;
    label: string;
    icon: React.ReactNode;
}

interface Node {
    id: string;
    position: {
        x: number;
        y: number;
    };
    data: {
        label: string;
    };
    type: string;
}

interface Edge {
    id: string;
    source: string;
    target: string;
    type: string;
}

export type { NodePalette, Node, Edge };