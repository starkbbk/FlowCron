import httpx
import asyncio
import json
import re
from typing import Any, Dict, List
from datetime import datetime

class NodeHandlers:
    @staticmethod
    async def manual_trigger(config: Dict, input_data: Any) -> Any:
        return {"triggered_at": datetime.utcnow().isoformat(), "triggered_by": "manual"}

    @staticmethod
    async def cron_trigger(config: Dict, input_data: Any) -> Any:
        return {"triggered_at": datetime.utcnow().isoformat(), "schedule": config.get("cron_expression")}

    @staticmethod
    async def webhook_trigger(config: Dict, input_data: Any) -> Any:
        # trigger_data is passed as input_data for triggers
        return input_data or {}

    @staticmethod
    async def http_request(config: Dict, input_data: Any) -> Any:
        url = config.get("url")
        method = config.get("method", "GET").upper()
        headers = config.get("headers", {})
        body = config.get("body")
        timeout = float(config.get("timeout_seconds", 30))

        async with httpx.AsyncClient() as client:
            response = await client.request(
                method, 
                url, 
                headers=headers, 
                content=body if isinstance(body, str) else json.dumps(body) if body else None,
                timeout=timeout
            )
            
            try:
                resp_body = response.json()
            except:
                resp_body = response.text

            return {
                "status_code": response.status_code,
                "headers": dict(response.headers),
                "body": resp_body,
                "response_time_ms": int(response.elapsed.total_seconds() * 1000)
            }

    @staticmethod
    async def if_condition(config: Dict, input_data: Any) -> Any:
        field_value = config.get("field")
        operator = config.get("operator", "equals")
        compare_value = config.get("value")
        
        result = False
        
        def to_float(v):
            try: return float(v)
            except: return None

        if operator == "equals":
            result = str(field_value) == str(compare_value)
        elif operator == "not_equals":
            result = str(field_value) != str(compare_value)
        elif operator == "greater_than":
            f1, f2 = to_float(field_value), to_float(compare_value)
            result = f1 > f2 if f1 is not None and f2 is not None else False
        elif operator == "less_than":
            f1, f2 = to_float(field_value), to_float(compare_value)
            result = f1 < f2 if f1 is not None and f2 is not None else False
        elif operator == "contains":
            result = str(compare_value) in str(field_value)
        elif operator == "not_contains":
            result = str(compare_value) not in str(field_value)
        elif operator == "is_empty":
            result = not field_value
        elif operator == "is_not_empty":
            result = bool(field_value)
        
        return {"condition_result": result, "evaluated_field": field_value}

    @staticmethod
    async def transform_node(config: Dict, input_data: Any) -> Any:
        # The executor already resolved variables in the config.template
        template = config.get("template", "{}")
        try:
            if isinstance(template, str):
                return json.loads(template)
            return template
        except:
            return {"error": "Invalid JSON template", "raw": template}

    @staticmethod
    async def delay_node(config: Dict, input_data: Any) -> Any:
        delay = float(config.get("delay_seconds", 5))
        await asyncio.sleep(delay)
        return {"delayed_seconds": delay, "resumed_at": datetime.utcnow().isoformat()}

    @staticmethod
    async def send_slack(config: Dict, input_data: Any) -> Any:
        url = config.get("webhook_url")
        message = config.get("message", "")
        async with httpx.AsyncClient() as client:
            res = await client.post(url, json={"text": message})
            return {"sent": res.status_code == 200, "status_code": res.status_code}

    @staticmethod
    async def send_discord(config: Dict, input_data: Any) -> Any:
        url = config.get("webhook_url")
        content = config.get("content", "")
        async with httpx.AsyncClient() as client:
            res = await client.post(url, json={"content": content})
            return {"sent": res.status_code in [200, 204]}

    @staticmethod
    async def send_email(config: Dict, input_data: Any) -> Any:
        # Mocking email sending for development as per plan.txt
        print(f"EMAIL MOCK: To: {config.get('to')}, Subject: {config.get('subject')}, Body: {config.get('body')}")
        return {"sent": True, "to": config.get("to"), "subject": config.get("subject")}

    @staticmethod
    async def switch_condition(config: Dict, input_data: Any) -> Any:
        field_val = str(config.get("field"))
        cases = config.get("cases", [])
        matched = "default"
        for case in cases:
            if field_val == str(case.get("value")):
                matched = case.get("label")
                break
        return {"matched_case": matched, "value": field_val}

    @staticmethod
    async def filter_node(config: Dict, input_data: Any) -> Any:
        array = config.get("array_field", [])
        if not isinstance(array, list):
            # Try to parse if it's a JSON string
            if isinstance(array, str):
                try: array = json.loads(array)
                except: array = []
            else:
                array = []
                
        field = config.get("condition_field")
        op = config.get("operator", "equals")
        val = str(config.get("value"))
        
        filtered = []
        for item in array:
            item_val = str(item.get(field)) if isinstance(item, dict) else str(item)
            if op == "equals" and item_val == val: filtered.append(item)
            elif op == "contains" and val in item_val: filtered.append(item)
            # Add more ops as needed...
            
        return {
            "filtered": filtered, 
            "original_count": len(array), 
            "filtered_count": len(filtered)
        }

    @staticmethod
    async def code_node(config: Dict, input_data: Any) -> Any:
        code = config.get("code", "")
        # A slightly more restricted execution for demo
        safe_globals = {"json": json, "datetime": datetime, "re": re}
        # input_data contains all previous node outputs
        local_vars = {"input": input_data, "result": None}
        
        try:
            # We expect the user to set 'result' or return it
            # For simplicity, we wrap in a function if it's not already
            exec_code = f"def run_code():\n" + "\n".join([f"    {line}" for line in code.split('\n')]) + "\nresult = run_code()"
            exec(exec_code, safe_globals, local_vars)
            return local_vars.get("result")
        except Exception as e:
            return {"error": str(e)}
