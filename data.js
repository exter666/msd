var model = {
    "name": "test",
    "components": [
        {
            "id": "s1",
            "name": "service 1",
            "type": "service",
            "x": 0,
            "y": 0,
            "customAttrs": {
                "attr1": "123",
                "attr2": "asdf"
            }
        },
        {
            "id": "q1",
            "name": "queue 1",
            "type": "queue",
            "x": 200,
            "y": 200
        },
        {
            "id": "q2",
            "name": "queue 2",
            "type": "queue",
            "x": 500,
            "y": 200
        },
        {
            "id": "db1",
            "name": "database 1",
            "type": "db",
            "x": 0,
            "y": 200
        },
        {
            "id": "s3",
            "name": "service 3",
            "type": "service",
            "x": 400,
            "y": 400
        },
        {
            "id": "s4",
            "name": "service 4",
            "type": "service",
            "x": 800,
            "y": 400
        }
    ],
    "links": [
        {
            "from": {
                "component": "s1",
                "position": 3,
            },
            "to": {
                "component": "db1",
                "position": 1
            }
        },
        {
            "from": {
                "component": "s1",
                "position": 2
            },
            "to": {
                "component": "q1",
                "position": 4,
                "topic": "topic 1"
            }
        },
        {
            "from": {
                "component": "s1",
                "position": 2
            },
            "to": {
                "component": "q2",
                "position": 4,
                "topic": "topic 2"
            }

        },
        {
            "from": {
                "component": "q1",
                "position": 2,
                "topic": "topic 1",
                "group": "group 1"
            },
            "to": {
                "component": "s3",
                "position": 4
            }
        },
        {
            "from": {
                "component": "q1",
                "position": 2,
                "topic": "topic 1",
                "group": "group 2"
            },
            "to": {
                "component": "s4",
                "position": 4
            }
        },
        {
            "from": {
                "component": "q2",
                "position": 2,
                "topic": "topic 2",
                "group": "group 1"
            },
            "to": {
                "component": "s4",
                "position": 4
            }
        },
        {
            "from": {
                "component": "s4",
                "position": 4
            },
            "to": {
                "component": "s3",
                "position": 2
            }
        }
    ]
}